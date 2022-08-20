const express = require("express");
const { checkIfAuthenticated } = require("../../middlewares");
const router = express.Router();
const cartServices = require("../../services/carts");

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

router.get("/", checkIfAuthenticated, async function (req, res) {
  // step 1: create the line items
  // one line in the invoice is one line item4
  // each item in the shopping cart will become line item
  const selecteditem = await cartServices.getCart(req.session.user.id);

  let lineItems = [];
  let meta = []; // metadata -- and we are going store for
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
    meta.push({
      cart_item_id: selected.get("cart_item_id"),
      variant_id: selected.get("variant_id"),
      quantity: selected.get("quantity"),
    });
  }

  // step 2: create stripe payment
  // the metadata must be a string
  let metaData = JSON.stringify(meta);
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
      orders: metaData,
      user_id: req.session.user.id,
    },
  };

  console.log("Hello");
  // step 3: register the payment session
  let stripeSession = await stripe.checkout.sessions.create(payment);

  // step 4: use stripe to pay
  res.render("checkout/checkout", {
    sessionId: stripeSession.id,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

router.get("/success", function (req, res) {
  res.send("Payment success");
});

router.get("/cancelled", function (req, res) {
  res.send("Payment cancelled");
});

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
    console.log("Event==>", event);
    if (event.type == "checkout.session.completed") {
      console.log(event.data.object);
      const metadata = JSON.parse(event.data.object.metadata.orders);
      console.log("Meta data==>", metadata);
      let transactionData = {};
      transactionData["payment_intent"] = metadata.payment_intent;
      transactionData["amount"] = metadata.amount;
      res.send({
        success: true,
      });
    } // checkout.session.completed ==> the payment is done
    // res.status(200);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

module.exports = router;
