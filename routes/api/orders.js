const express = require("express");
const router = express.Router();
const { getOrderByCustomerId, getallOrders } = require("../../dal/orders");

router.get('/:customer_id', async (req, res) => {
    try {
        const orders = await getOrderByCustomerId(req.params.customer_id)
        res.send(orders)
    } catch {
        res.sendStatus(500)
    }

})

// router.get("/", async (req, res) => {
//   try {
//     const orders = await dataLayer.getallOrders();
//     res.send(orders);
//   } catch {
//     res.sendStatus(500);
//   }
// });
module.exports = router;
