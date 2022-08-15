const cartDataLayer = require("../dal/carts");

async function addToCart(customerId, productId, quantity) {

  const cartItem = await cartDataLayer.getCartByCustomerVariant(customerId, productId);
  if (!cartItem) {

    await cartDataLayer.createCart(customerId, productId, quantity);
  } else {

    await cartDataLayer.updateQuantity(customerId, productId, cartItem.get("quantity") + 1);
  }
  return true;
}

async function getCart(customerId) {
  return cartDataLayer.getCart(customerId);
}

async function updateQuantity(customerId, productId, newQuantity) {
  return cartDataLayer.updateQuantity(customerId, productId, newQuantity);
}

async function remove(customerId, productId) {
  return cartDataLayer.removeCartItem(customerId, productId);
}

module.exports = { addToCart, getCart, updateQuantity, remove };
