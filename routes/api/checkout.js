const express = require("express");
const { checkIfAuthenticated } = require("../../middlewares");
const router = express.Router();
const cartServices = require("../../services/carts");
const orderServices = require("../../services/orders");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY) {
//   apiVersion: '2017-06-05',
// };

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});
const paymentIntent = stripe.paymentIntents.create({
  amount: 1099,
  currency: "sgd",
  payment_method_types: ["card"],
});

let transactionData = {}; // for creating order to link to list of order items
router.get("/", async function (req, res) {
  // step 1: create the line items
  // one line in the invoice is one line item4
  // each item in the shopping cart will become line item
  // const selecteditem = await cartServices.getCart(req.session.user.id);
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
      // Stripe expect images to be an array
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

  // step 2: create stripe payment
  // cannot send list of javascript object, Only can send data in string typdata type
  let orderListJsonStr = JSON.stringify(orderList);
  // the key/value pairs in the payment are defined by Stripes
  const payment = {
    payment_method_types: ["card", "grabpay"],
    line_items: lineItems,
    success_url: process.env.STRIPE_SUCCESS_URL + "?sessionId={CHECKOUT_SESSION_ID}",
    cancel_url: process.env.STRIPE_CANCEL_URL,
    // shipping_option:{
    //   id: 'basic',
    //   label: 'Ground shipping',
    //   detail: 'Ground shipping via UPS or FedEx',
    //   amount: 995,
    // },
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
    // in the metadata, the keys are up to us
    // but the value MUST BE A STRING
    metadata: {
      orders: orderListJsonStr,
      user_id: userId,
    },
  };

  console.log("stripeSession Hello");
  transactionData = {};
  // step 3: register the payment session
  let stripeSession = await stripe.checkout.sessions.create(payment);
  console.log("stripeSession Completed");
  // step 4: use stripe to pay'
  res.status(200);
  res.json({
    sessionId: stripeSession.id,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
  // res.render("checkout/checkout", {
  //   sessionId: stripeSession.id,
  //   publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  // });
});

// router.get("/success", function (req, res) {
//   res.send(
//     "Payment Success: <a href='https://pay.stripe.com/receipts/payment/CAcaFwoVYWNjdF8xTFMxRzFHSFRYOTc2R1JmKJK1hJgGMgam9a_GXCg6LBYko_1AyqcSvp-kcnz6YGJXSKwVBfVgkKIsAV3Ki21AxFQovmr4HAJv7tMw'>Receipt URL</a>"
//   );
// });

// router.get("/cancelled", function (req, res) {
//   res.send("Payment cancelled");
// });

// Webhook for Stripe
// has to be POST -- 1) we are changing our database on based on payment info
//                   2) Stripe decides that way
router.post("/process_payment", express.raw({ type: "application/json" }), async function (req, res) {
  console.log("Hello2");
  let payload = req.body; // payment information is inside req.body
  let endpointSecret = process.env.STRIPE_ENDPOINT_SECRET; // each webhook will have one endpoint secret
  console.log("enpoint Secret==>", endpointSecret);
  // ensures that Stripe is the one sending the information
  let sigHeader = req.headers["stripe-signature"]; // when strip sends us the information, there will be a signature in the header
  // the key will be `stripe-signature`
  let event = null;
  // try to extract out the information and ensures that its' legit (it acutally comes from Stripe)
  try {
    event = stripe.webhooks.constructEvent(payload, sigHeader, endpointSecret);

    // if (event.type == "charge.succeeded") {
    //   console.log("Charge SucceededEvent==>", event);

    //   const eventDataObject = event.data.object;
    //   console.log("billing_details==>", eventDataObject.billing_details);
    //   console.log("payment_method_details==>", eventDataObject.payment_method_details);
    //   console.log("receipt_url==>", eventDataObject.receipt_url);
    //   console.log("shipping==>", eventDataObject.shipping);
    //   transactionData["payment_type"] = eventDataObject.payment_method_details.type;
    //   transactionData["receipt_url"] = eventDataObject.receipt_url;
    //   transactionData["billing_address_line1"] = eventDataObject.billing_details.address.line1;
    //   transactionData["billing_address_line2"] = eventDataObject.billing_details.address.line2 || "";
    //   transactionData["billing_address_postal"] = eventDataObject.billing_details.address.postal_code;
    //   transactionData["billing_address_country"] = eventDataObject.billing_details.address.country;
    //   transactionData["shipping_address_line1"] = eventDataObject.shipping.address.line1;
    //   transactionData["shipping_address_line2"] = eventDataObject.shipping.address.line2 || "";
    //   transactionData["shipping_address_postal"] = eventDataObject.shipping.address.postal_code;
    //   transactionData["shipping_address_country"] = eventDataObject.shipping.address.country;
    //   transactionData["shipping_option"] = "-";
    //   transactionData["delivery_date"] = undefined;
    //   console.log("Charge transactionData==>", transactionData);
    // }
    if (event.type == "checkout.session.completed") {
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
      // console.log("Payment Type ==>", eventDataObject.payment_method_types);
      //---

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

      // console.log("shipping_options==>", eventDataObject.shipping_options);
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
