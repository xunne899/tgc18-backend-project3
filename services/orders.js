const dataLayer = require("../dal/orders");

async function addNewOrder(transactionData, orderList) {
  const newOrder = await dataLayer.createOrder(transactionData);
  console.log("new created order==>", newOrder.toJSON());
  let newOrderId = newOrder.toJSON().id;
  for (let item of orderList) {
    await dataLayer.createOrderItem(newOrderId, item["variant_id"], item["quantity"]);
  }
}

async function getOrderByOrderId(id) {
  return await dataLayer.getOrderByOrderId(id);
}
// get all order items of an order by order id
async function getOrderItemByOrderId(id) {
  return await dataLayer.getOrderItemByOrderId(id);
}

async function deleteOrder() {
  const orderItems = await dataLayer.getOrderItemByOrderId(order_id);
  for (let item of orderItems.toJSON()) {
    const variant = await getVariantById(item.variant_id);
    variant.set("stock", variant.get("stock") + item.quantity);
    await variant.save();
  }

  await dataLayer.deleteOrder(order_id);
}

async function getAllCustomers() {
  const allCustomers = await dataLayer.getAllCustomers();

  return allCustomers;
}

async function updateStatus(orderId, newStatusId) {
  return await dataLayer.updateStatus(orderId, newStatusId);
}

async function getAllStatuses() {
  const allStatuses = await dataLayer.getAllStatuses();
  return allStatuses;
}
module.exports = { addNewOrder, getOrderByOrderId, getOrderItemByOrderId, getAllStatuses, deleteOrder, updateStatus, getAllCustomers };
