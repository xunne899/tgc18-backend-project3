const express = require("express");
const router = express.Router();
const { getOrderByCustomerId, getOrderByOrderId } = require("../../dal/orders");

router.get("/", async (req, res) => {
  try {
    const jwtInfo = req.customer; // comes from jwt processing
    const userId = jwtInfo.id;
    const orderlist = await getOrderByCustomerId(userId);
    const pendingOrders = orderlist.toJSON().filter((order) => {
      // console.log(order.order_statuses);
      return order.orderStatus.order_status !== "Paid";
    });
    const successfulOrders = orderlist.toJSON().filter((order) => {
      return order.orderStatus.order_status === "Paid";
    });
    res.status(200);
    res.json({ pendingOrder: pendingOrders, completedOrder: successfulOrders });
  } catch {
    res.sendStatus(500);
  }
});

router.get("/:order_id", async (req, res) => {
  try {
    const orderId = req.params.order_id;
    const orderlist = await getOrderByOrderId(orderId);
    res.status(200);
    res.json(orderlist);
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
