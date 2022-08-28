const cartServices = require("../services/carts");
const express = require("express");
const { checkIfAuthenticated } = require("../../middlewares");
// const { Router } = require('express')

const router = express.Router();

router.get("/", async function (req, res) {
  const cartItems = await cartServices.getCart(req.session.user.id);
  res.render("cart/index", {
    cartItems: cartItems.toJSON(),
  });
});

router.get("/:variant_id/add", async function (req, res) {
  const userId = req.session.user.id;
  const variantId = req.params.variant_id;
  const variantQty = 1;
  await cartServices.addToCart(userId, variantId, variantQty);
  req.flash("success_messages", "Item Added to cart successfully");
  res.redirect("/cart/");
});

router.post("/:variant_id/add", async function (req, res) {
  const userId = req.session.user.id;
  const variantId = req.params.variant_id;
  const variantQty = req.body.quantity;
  await cartServices.addToCart(userId, variantId, variantQty);
  req.flash("success_messages", "Item Added to cart successfully");
  res.redirect("/cart/");
});

router.post("/:variant_id/update", async function (req, res) {
  const userId = req.session.user.id;
  const variantId = req.params.variant_id;
  if (req.body.newQuantity > 0) {
    await cartServices.updateQuantity(userId, variantId, req.body.newQuantity);
    req.flash("success_messages", "New Quantity updated");
    res.redirect("/cart");
  } else {
    req.flash("error_messages", "Quantity must be > 0");
    res.redirect("/cart/");
  }
});

router.put("/:variant_id/update", async function (req, res) {
  const userId = req.session.user.id;
  const variantId = req.params.variant_id;
  if (req.body.newQuantity > 0) {
    await cartServices.updateQuantity(userId, variantId, req.body.newQuantity);
    req.flash("success_messages", "New Quantity updated");
    res.redirect("/cart");
  } else {
    req.flash("error_messages", "Quantity must be > 0");
    res.redirect("/cart/");
  }
});

router.get("/:variant_id/delete", async function (req, res) {
  await cartServices.removeCartItem(req.session.user.id, req.params.variant_id);
  req.flash("success_messages", "Item has been removed from cart");
  res.redirect("/cart/");
});

router.delete("/:variant_id/delete", async function (req, res) {
  await cartServices.removeCartItem(req.session.user.id, req.params.variant_id);
  req.flash("success_messages", "Item has been removed from cart");
  res.redirect("/cart/");
});

module.exports = router;
