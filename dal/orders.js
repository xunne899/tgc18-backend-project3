const { OrderItem, Order, OrderStatus, Customer } = require("../models");

const getOrderByOrderId = async (orderId) => {
  return await Order.where({
    id: orderId,
  }).fetch({
    require: false,
    withRelated: ["customer", "orderStatus", "orderItems"],
  });
};

const getOrderByCustomerId = async (customerId) => {
  return await Order.collection()
    .where({
      id: customerId,
    })
    .fetch({
      require: false,
      withRelated: [
        // "variants",
        "customer",
        "orderStatus",
        "orderItems",
        "orderItems.variant.product",
        "orderItems.variant.size",
        "orderItems.variant.spiciness",
      ],
    });
};

async function getAllCustomers() {
  const customers = await Customer.fetchAll().map((customer) => {
    return [customer.get("id"), customer.get("customer")];
  });
  return customers;
}

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
  const statuses = await OrderStatus.fetchAll().map((status) => {
    return [status.get("id"), status.get("order_status")];
  });
  statuses.unshift(["", "--- Any Status ---"]);
  return statuses;
};

const updateStatus = async (orderId, newStatusId) => {
  const order = await getOrderByOrderId(orderId);
  order.set("order_status_id", newStatusId);
  await order.save();
  return order;
};

const getOrderItemByOrderId = async (orderId) => {
  return await OrderItem.where({
    id: orderId,
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

async function getallOrders() {
  return await Order.fetchAll({
    withRelated: ["customer", "orderStatus", "orderItems"],
  });
}

// async function getAllProducts() {
//   return await Product.fetchAll({
//       withRelated:["type", "country", "packaging", "cuisine_styles", "ingredients","variants"]
//   });
// }

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
  getAllCustomers,
  getallOrders,
};
