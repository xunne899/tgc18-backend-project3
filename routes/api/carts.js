const cartServices = require("../../services/carts");
const express = require("express");
const { checkIfAuthenticated } = require("../../middlewares");
// const { Router } = require('express')

const router = express.Router();

router.get("/", async function (req, res) {
  const cartItems = await cartServices.getCart(req.session.user.id);
  res.status(200);
  res.json({
    cartItems: cartItems.toJSON(),
  });
  // res.render("cart/index", {
  //   cartItems: cartItems.toJSON(),
  // });
});

router.post("/:variant_id/add", async function (req, res) {
  const userId = req.session.user.id;
  const variantId = req.params.variant_id;
  const variantQty = req.body.quantity;
  await cartServices.addToCart(userId, variantId, variantQty);
  res.status(200);
  res.json({
    statusMessage: "Successful",
  });
});

router.put("/:variant_id/update", async function (req, res) {
  const userId = req.session.user.id;
  const variantId = req.params.variant_id;
  if (req.body.newQuantity > 0) {
    await cartServices.updateQuantity(userId, variantId, req.body.newQuantity);
    res.status(200);
    res.json({
      statusMessage: "Successful",
    });
  } else {
    res.status(400);
    res.json({
      statusMessage: "Quantity must be > 0",
    });
  }
});

router.delete("/:variant_id/delete", async function (req, res) {
  await cartServices.removeCartItem(req.session.user.id, req.params.variant_id);
  res.status(200);
  res.json({
    statusMessage: "Item has been removed from cart",
  });
});

module.exports = router;
