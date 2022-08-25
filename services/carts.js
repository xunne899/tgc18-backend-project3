const cartDataLayer = require("../dal/carts");

async function addToCart(customerId, productId, quantity) {
  const cartItem = await cartDataLayer.getCartByCustomerVariant(customerId, productId);
  if (!cartItem) {
    await cartDataLayer.createCartItem(customerId, productId, quantity);
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

// used to remove single cart item, funcion declaration
async function removeCartItem(customerId, productId) {
  return cartDataLayer.removeCartItem(customerId, productId);
}

// used to remove all cart items of customer
async function removeAllCartItems(customerId, orderList) {
  // Upon successful payment, clear away customer cart to make it empty.
  for (let item of orderList) {
    await cartDataLayer.removeCartItem(customerId, item["variant_id"]);
  }
}

// export function out for other files to use
module.exports = { addToCart, getCart, updateQuantity, removeCartItem, removeAllCartItems };
