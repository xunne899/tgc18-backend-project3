const express = require("express");
const router = express.Router();
const serviceLayer = require("../services/orders");
const { bootstrapField, createStatusForm, createOrderSearchForm } = require("../forms");
const { getCustomerEmail } = require("../dal/customers");
const { Order } = require("../models");

router.get("/", async (req, res) => {
  const SearchOrderForm = createOrderSearchForm(await serviceLayer.getAllStatuses());
  // console.log(SearchOrderForm, "Searchorder");
  const query = Order.collection();

  SearchOrderForm.handle(req, {
    success: async (form) => {
      console.log("search data =>", form.data);
      //console.log(form.data.email, "data");
      if (form.data.id) {
        query.where("id", "=", form.data.id);
      }

      if (form.data.email) {
        const customer = await getCustomerEmail(form.data.email);
        console.log(customer);

        customer ?  query.where("customer_id", "=", customer.get("id")) :  query.where('customer_id', '=', '')
        // if (customer) {
        //   query.where("customer_id", "=", customer.get("id"));
        // }else {
        //     query.where('customer_id', '=', '')
        // }
    }
    //   if (form.data.customer_email) {
    //     searchQuery.query('join', 'customers', 'customers.id', 'customer_id')
    //         .where('email', 'like', `%${form.data.customer_email}%`)
    // }

      if (form.data.order_date) {
        let orderDate = new Date(form.data.order_date);
        let nextDay = new Date(form.data.order_date);

        orderDate.setHours(0);
        orderDate.setMinutes(0);
        orderDate.setSeconds(0);
        nextDay.setDate(orderDate.getDate() + 1);
        console.log("Created date=>", orderDate);
        console.log("Next date=>", nextDay);
        query.where("order_date", ">=", orderDate); // must be more than equal 23/08/2022 0:00
        query.where("order_date", "<", nextDay); // must be less than 24/08/2022 0:00
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
      const numberFound = orderlist.toJSON().length;
      res.render("orders/index", {
        form: form.toHTML(bootstrapField),
        numberFound,
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

router.get("/:order_id/item", async (req, res) => {
  // const services = new serviceLayer(req.params.order_id);
  const order = await serviceLayer.getOrderByOrderId(req.params.order_id);
  // const orderItems = await serviceLayer.getOrderItemByOrderId(req.params.order_id);
  const statusUpdateForm = createStatusForm(await serviceLayer.getAllStatuses());

  statusUpdateForm.fields.order_status_id.value = order.get("order_status_id");

  res.render("orders/items_order", {
    order: order.toJSON(),
    // orderItems: orderItems.toJSON(),
    form: statusUpdateForm.toHTML(bootstrapField),
  });
});

router.post("/:order_id/update", async (req, res) => {
  const orderId = req.params.order_id;
  //const order = await serviceLayer.getOrderByOrderId(orderId);
  const orderStatus = await serviceLayer.getAllStatuses();
  // const services = new serviceLayer(req.params.order_id);
  // await services.updateStatus(req.body.id);

  // Process update order form
  const orderForm = createStatusForm({
    orderStatus,
  });
  orderForm.handle(req, {
    // success: async function (form) {
    //   const { order_date, orderData } = form.data;

    //   try {
    //     await dataLayer.updateOrder(orderId, orderData);

    //     req.flash('success_messages', 'Order successfully updated');
    //     res.redirect('/orders');
    //   } catch (error) {
    //     console.log(error);
    //     req.flash('error_messages', 'An error occurred while updating order. Please try again');
    //     res.redirect(`/orders/${orderId}/update`);
    //   }
    // },
    // error: async function (form) {
    //   res.render('orders/update', {
    //     form: form.toHTML(bootstrapField)
    //   });
    // },
    success: async (form) => {
      try {
        await serviceLayer.updateStatus(orderId, form.data.order_status_id);
        req.flash("success_messages", "Order successfully updated");
        res.redirect("/orders");
      } catch (e) {
        console.error(e);
        req.flash("error_messages", "An error occurred while updating order. Please try again");
        res.redirect(`/orders/${orderId}/item`);
      }
    },
    error: async function (form) {
      req.flash("error_messages", "An error occurred while updating order. Please try again");
      res.redirect(`/orders/${orderId}/item`);
    },
  });
});

// router.post('/:order_id/update', async function (req, res) {
//   // Get order to be updated
//   const orderId = req.params.order_id;
//   const order = await dataLayer.getOrderById(orderId);

//   // Fetch all choices for update order form
//   const orderStatuses = await dataLayer.getAllOrderStatuses();

//   // Process update order form
//   const orderForm = createUpdateOrderForm({
//     orderStatuses
//   });
//   orderForm.handle(req, {
//     success: async function (form) {
//       const { order_date, orderData } = form.data;

//       try {
//         await dataLayer.updateOrder(orderId, orderData);

//         req.flash('success_messages', 'Order successfully updated');
//         res.redirect('/orders');
//       }

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
