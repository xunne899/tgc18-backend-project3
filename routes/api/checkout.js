const express = require("express");
const { checkIfAuthenticatedJWT } = require("../../middlewares");
const router = express.Router();
const cartServices = require("../../services/carts");
const orderServices = require("../../services/orders");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});
const paymentIntent = stripe.paymentIntents.create({
  amount: 1099,
  currency: "sgd",
  payment_method_types: ["card"],
});

router.get("/", checkIfAuthenticatedJWT, express.json(), async function (req, res) {
  //  create the line items

  const jwtInfo = req.customer; // comes from jwt processing
  const userId = jwtInfo.id;
  const selecteditem = await cartServices.getCart(userId);

  let lineItems = [];
  let orderList = []; // orderList -- and we are going store for
  // each product id how many the user is buying (i.e the quantity)
  for (let selected of selecteditem) {
    // each keys in the line item is prefixed by Stripe
    const eachLineItem = {
      name: selected.related("variant").related("product").get("name"),
      amount: selected.related("variant").get("cost"),
      quantity: selected.get("quantity"),
      currency: "SGD",
    };

    // check if there's an image
    if (selected.related("variant").get("image_url")) {
      eachLineItem.images = [selected.related("variant").get("image_url")];
    }

    lineItems.push(eachLineItem);

    // adding orderItem for each variant in the cart
    orderList.push({
      cart_item_id: selected.get("cart_item_id"),
      variant_id: selected.get("variant_id"),
      quantity: selected.get("quantity"),
    });
  }

  let orderListJsonStr = JSON.stringify(orderList);
  // the key/value pairs in the payment are defined by Stripes
  const payment = {
    payment_method_types: ["card", "grabpay"],
    line_items: lineItems,
    success_url: process.env.STRIPE_SUCCESS_URL + "?sessionId={CHECKOUT_SESSION_ID}",
    cancel_url: process.env.STRIPE_CANCEL_URL,

    shipping_address_collection: {
      allowed_countries: ["SG", "AU", "GB", "US", "TH", "BN", "TR", "SA", "MY", "ID"],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 0,
            currency: "SGD",
          },
          display_name: "Free shipping",
          // Delivers between 5-7 business days
          delivery_estimate: {
            minimum: {
              unit: "business_day",
              value: 9,
            },
            maximum: {
              unit: "business_day",
              value: 22,
            },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: 40000,
            currency: "SGD",
          },
          display_name: "Next Day Delivery",
          // Delivers in exactly 1 business day
          delivery_estimate: {
            minimum: {
              unit: "business_day",
              value: 1,
            },
            maximum: {
              unit: "business_day",
              value: 1,
            },
          },
        },
      },
    ],
    billing_address_collection: "required",

    metadata: {
      orders: orderListJsonStr,
      user_id: userId,
    },
  };

  console.log("stripeSession Hello");

  let stripeSession = await stripe.checkout.sessions.create(payment);
  console.log("stripeSession Completed");

  res.status(200);
  res.json({
    sessionId: stripeSession.id,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

router.post("/process_payment", express.raw({ type: "application/json" }), async function (req, res) {
  console.log("Hello2");
  let payload = req.body; // payment information is inside req.body
  let endpointSecret = process.env.STRIPE_ENDPOINT_SECRET; // each webhook will have one endpoint secret
  console.log("enpoint Secret==>", endpointSecret);

  let sigHeader = req.headers["stripe-signature"]; // when strip sends us the information, there will be a signature in the header

  let event = null;
  // try to extract out the information and ensures that its' legit (it acutally comes from Stripe)
  try {
    event = stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret);

    if (event.type == "checkout.session.completed") {
      let transactionData = {}; // for creating order to link to list of order items
      console.log("Event completed==>", event);
      const eventDataObject = event.data.object;
      // convert JsonStr back into list of javascript object
      const metadata = eventDataObject.metadata;
      console.log("Metadata user_id=====>", metadata.user_id); // orderList and customer id
      const paymentInformation = await stripe.paymentIntents.retrieve(eventDataObject.payment_intent);

      console.log("paymentIntents paymentInformation=====>", paymentInformation);
      console.log("paymentInformation charges=====>", paymentInformation.charges.data);
      const charges = paymentInformation.charges.data[0];

      const shippingInfo = await stripe.shippingRates.retrieve(eventDataObject.shipping_rate);
      console.log("shippingInfo=====>", shippingInfo);

      const orderList = JSON.parse(metadata.orders);
      console.log("Metadata orderList=====>", orderList); // orderList and customer id
      console.log("Metadata customer_details=====>", eventDataObject.customer_details);
      console.log("Metadata total_details=====>", eventDataObject.total_details);
      console.log("Metadata metadata=====>", eventDataObject.metadata);
      console.log("Metadata shipping=====>", eventDataObject.shipping);
      console.log("Metadata shipping_address_collection=====>", eventDataObject.shipping_address_collection);

      transactionData["payment_type"] = charges.payment_method_details.type;
      transactionData["receipt_url"] = charges.receipt_url;
      transactionData["billing_address_line1"] = eventDataObject.customer_details.address.line1;
      transactionData["billing_address_line2"] = eventDataObject.customer_details.address.line2 || "";
      transactionData["billing_address_postal"] = eventDataObject.customer_details.address.postal_code;
      transactionData["billing_address_country"] = eventDataObject.customer_details.address.country;
      transactionData["shipping_address_line1"] = eventDataObject.shipping.address.line1;
      transactionData["shipping_address_line2"] = eventDataObject.shipping.address.line2 || "";
      transactionData["shipping_address_postal"] = eventDataObject.shipping.address.postal_code;
      transactionData["shipping_address_country"] = eventDataObject.shipping.address.country;
      transactionData["shipping_option"] = shippingInfo.display_name;
      transactionData["delivery_date"] = undefined;
      //---
      transactionData["total_cost"] = eventDataObject.amount_total;
      transactionData["order_date"] = new Date(event.created * 1000); // convert timestamp to  datetime, 1000 to change s to ms.
      transactionData["customer_id"] = metadata.user_id;

      transactionData["payment_intent"] = eventDataObject.payment_intent;
      transactionData["order_status_id"] = 1; // 1 means successful,
      console.log("shipping==>", eventDataObject.shipping);
      console.log("Complete transactionData==>", transactionData);
      orderServices.addNewOrder(transactionData, orderList);
      cartServices.removeAllCartItems(metadata.user_id, orderList);
      res.status(200);
      res.json({
        success: true,
      });
    } // checkout.session.completed ==> the payment is done
    // res.status(200);
  } catch (e) {
    console.log(e);
    res.status(500);
  }
});

module.exports = router;
