const express = require("express");
const router = express.Router();
const orderItem = require("../services/orders");
const { bootstrapField, createStatusForm, createOrderSearchForm } = require("../forms");
const { getCustomerEmail } = require("../dal/customers");
const { Order } = require("../models");

router.get("/", async (req, res) => {
  const SearchOrderForm = createOrderSearchForm(await orderItem.getAllStatuses());
  // console.log(SearchOrderForm, "Searchorder");
  const query = Order.collection();

  SearchOrderForm.handle(req, {
    success: async (form) => {
      // console.log(form.data, "data");
      // console.log(form.data.email, "data");
      if (form.data.id) {
        query.where("id", "=", form.data.id);
      }
      // const customer = await getCustomerEmail(form.data.email);
      // if (form.data.email) {
      //   // query.where("customer_id", "=", customer.get(form.data.email));
      //   const customer = await getCustomerEmail(form.data.email);
      //   console.log(customer);
      //   if (customer) {
      //     query.where("id", "=", customer.get("id"));
      //   } else {
      //     query.where("id", "=", "0");
      //   }
      // }
      // console.log(form.data.email, "data");

      if (form.data.order_date) {
        query.where("order_date", "=", form.data.order_date);
      }

      if (form.data.order_status_id) {
        query.where("order_status_id", "=", form.data.order_status_id);
      }
      const orderlist = await query.fetch({
        withRelated: ["customer", "orderStatus", "orderItems"],
      });

      const resultsNum = orderlist.toJSON().length;

      const pending = orderlist.toJSON().filter((order) => {
        // console.log(order.order_statuses);
        return order.orderStatus.order_status !== "Paid";
      });
      const successful = orderlist.toJSON().filter((order) => {
        return order.orderStatus.order_status === "Paid";
      });

      res.render("orders/index", {
        form: form.toHTML(bootstrapField),
        resultsNum,
        pending,
        successful,
      });
    },
    empty: async (form) => {
      const orderlist = await query.fetch({
        withRelated: ["customer", "orderStatus", "orderItems"],
      });

      const resultsNum = orderlist.toJSON().length;

      const pending = orderlist.toJSON().filter((order) => {
        // console.log(order.orderStatus.order_status);
        return order.orderStatus.order_status !== "Paid";
      });
      const successful = orderlist.toJSON().filter((order) => {
        return order.orderStatus.order_status === "Paid";
      });
      console.log("show success", successful);
      res.render("orders/index", {
        form: form.toHTML(bootstrapField),
        resultsNum,
        pending,
        successful,
      });
    },
  });
});
// })

// router.get("/", async (req, res) => {

//   // const customers = await getAllCustomers();
//   const statuses = await orderItem.getAllStatuses();

//   const searchOrderForm = createOrderSearchForm("customer", "orderStatus", "orderItems", "variants");
//  // create a query builder
//  let query = Order.collection();

//  // our search logic begins here
//  searchOrderForm.handle(req, {
//    success: async function (form) {
//      // if the user did provide the name
//     //  if (form.data.email) {
//     //    query.where("name", "like", "%" + form.data.name + "%");
//     //  }

//           // if (form.data.email) {
//           //   const customer = await getCustomerEmail(form.data.email);
//           //    if (customer) {
//           //     query.where("customer_id", "=", customer.get("customer_id"));
//           //     } else {
//           //     query.where("customer_id", "=", "0");
//           //      }
//           //     }

//                 if (form.data.order_id) {
//                   query.where("order_id", "=", form.data.order_id);
//                 }

//                 if (form.data.order_date) {
//                   query.where("order_date", "=", form.data.order_date);
//                 }

//                 if (form.data.order_status_id) {
//                   query.where("status_id", "=", form.data.order_status_id);
//                 }

//      // #2 - fetch all the products (ie, SELECT * from products)
//      const orders = await query.fetch({
//        withRelated: ["customer", "orderStatus", "orderItems", "variants"],
//      });
//      const numberFound = products.toJSON().length;
//      req.flash("Order has been found");
//      res.render("orders/index", {
//        orders: orders.toJSON(),
//        numberFound,
//        form: form.toHTML(bootstrapField),
//      });
//    },
//    empty: async function () {
//      const orders = await query.fetch({
//        withRelated: ["customer", "orderStatus", "orderItems", "variants"],
//      });

//      res.render("products/index", {
//        orders: orders.toJSON(),
//        form: searchOrderForm.toHTML(bootstrapField),
//      });
//    },
//    error: async function () {},
//  });
// });

router.get("/:order_id/item", async (req, res) => {
  // const services = new orderItem(req.params.order_id);
  const order = await orderItem.getOrderByOrderId(req.params.order_id);
  const orderItems = await orderItem.getOrderItemByOrderId(req.params.order_id);
  // const statusForm = createStatusForm(await orderItem.getAllStatuses());

  // statusForm.fields.status_id.value = order.get("order_status_id");

  res.render("orders/items_order", {
    order: order.toJSON(),
    orderItems: orderItems.toJSON(),
    // form: statusForm.toHTML(bootstrapField),
  });
});

router.post("/:order_id/status/update", async (req, res) => {
  const services = new orderItem(req.params.order_id);
  await services.updateStatus(req.body.status_id);
  req.flash("success_messages", "Order status changed.");
  res.redirect(`/orders/${req.params.order_id}/item`);
});

// router.get("/:order_id/delete", async (req, res) => {
//   const services = new orderItem(req.params.order_id);
//   const order = await services.getOrderByOrderId();
//   if (order.toJSON().order_status.order_status === "Paid") {
//     req.flash("error_messages", "Completed orders cannot be deleted.");
//     res.redirect("/orders");
//   } else {
//     res.render("orders/delete", {
//       order: order.toJSON(),
//     });
//   }
// });

// router.post("/:order_id/delete", async (req, res) => {
//   const services = new orderItem(req.params.order_id);
//   await services.deleteOrder();
//   req.flash("success_messages", "Order has been deleted.");
//   res.redirect("/orders");
// });

module.exports = router;
