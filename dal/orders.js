const { OrderItem, Order, Status } = require("../models");

const getOrderByOrderId = async (orderId) => {
  return await Order.where({
    order_id: orderId,
  }).fetch({
    require: false,
    withRelated: ["customer", "status", "orderItems", "variants"],
  });
};

const getOrderByCustomerId = async (customerId) => {
  return await Order.collection()
    .where({
      customer_id: customerId,
    })
    .fetch({
      require: false,
      withRelated: ["variants", "customer", "status", "orderItems", "orderItems.variant.product", "orderItems.variant.size", "orderItems.variant.spiciness"],
    });
};

const createOrder = async (transactionData) => {
  const order = new Order(transactionData);
  await order.save();
  return order;
};

const deleteOrder = async (orderId) => {
  const order = await getOrderByOrderId(orderId);
  await order.destroy();
};

const getAllStatuses = async () => {
  return await Status.fetchAll().map((status) => {
    return [status.get("order_status_id"), status.get("order_status")];
  });
};

const updateStatus = async (orderId, newStatusId) => {
  const order = await getOrderByOrderId(orderId);
  order.set("order_status_id", newStatusId);
  await order.save();
  return order;
};

const getOrderItemByOrderId = async (orderId) => {
  return await OrderItem.where({
    order_id: orderId,
  }).fetchAll({
    require: false,
    withRelated: ["variant", "variant.product.name", "variant.size", "variant.spiciness"],
  });
};

const getOrderItemByVariantId = async (variantId) => {
  return await OrderItem.where({
    variant_id: variantId,
  }).fetchAll({
    require: false,
  });
};

const createOrderItem = async (orderId, variantId, quantity) => {
  const orderItem = new OrderItem({
    order_id: orderId,
    variant_id: variantId,
    quantity,
  });
  await orderItem.save();
  return orderItem;
};

module.exports = {
  getOrderByCustomerId,
  getOrderByOrderId,
  createOrder,
  deleteOrder,
  getAllStatuses,
  updateStatus,
  getOrderItemByOrderId,
  getOrderItemByVariantId,
  createOrderItem,
};
