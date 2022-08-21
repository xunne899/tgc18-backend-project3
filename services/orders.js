const dataLayer = require("../dal/orders");
// const router = express.Router();

async function addNewOrder(transactionData, orderList) {
  const newOrder = await dataLayer.createOrder(transactionData);
  console.log("new created order==>", newOrder.toJSON());
  let newOrderId = newOrder.toJSON().id;
  for (let item of orderList) {
    await dataLayer.createOrderItem(newOrderId, item["variant_id"], item["quantity"]);
  }
}

async function getOrderByOrderId() {
  return await dataLayer.getOrderByOrderId(this.order_id)
}
// get all order items of an order by order id
async function getOrderItemByOrderId() {
  return await dataLayer.getOrderItemByOrderId(this.order_id)
}

async function deleteOrder() {

  const orderItems = await dataLayer.getOrderItemByOrderId(this.order_id)
  // if (orderItems.toJSON().length !== 0) {
      for (let item of orderItems.toJSON()) {
          const variant = await getVariantById(item.variant_id)
          variant.set('stock', variant.get('stock') + item.quantity)
          await variant.save()
      }
  // }
  await dataLayer.deleteOrder(this.order_id)
}



async function updateStatus(newStatusId) {
  return await dataLayer.updateStatus(this.order_id, newStatusId)
}



async function getAllStatuses() {
  const allStatuses = await dataLayer.getAllStatuses()
 
  return allStatuses
}
module.exports = { addNewOrder,getOrderByOrderId,getOrderItemByOrderId ,getAllStatuses, deleteOrder,updateStatus};
