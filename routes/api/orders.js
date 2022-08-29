const express = require("express");
const router = express.Router();
const { getOrderByCustomerId, getallOrders } = require("../../dal/orders");

router.get("/", async (req, res) => {
  try {
    const jwtInfo = req.customer; // comes from jwt processing
    const userId = jwtInfo.id;
    const orders = await getOrderByCustomerId(userId);
    res.status(200);
    res.json(orders);
  } catch {
    res.sendStatus(500);
  }
});

// router.get("/", async (req, res) => {
//   try {
//     const orders = await dataLayer.getallOrders();
//     res.send(orders);
//   } catch {
//     res.sendStatus(500);
//   }
// });
module.exports = router;
