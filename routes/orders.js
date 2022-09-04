const express = require("express");
const router = express.Router();
const serviceLayer = require("../services/orders");
const { bootstrapField, createStatusForm, createOrderSearchForm } = require("../forms");
const { getCustomerEmail } = require("../dal/customers");
const { Order } = require("../models");

router.get("/", async (req, res) => {
  const SearchOrderForm = createOrderSearchForm(await serviceLayer.getAllStatuses());
  
  const query = Order.collection();

  SearchOrderForm.handle(req, {
    success: async (form) => {
   
      
      if (form.data.min_total_cost !== undefined && !isNaN(parseFloat(form.data.min_total_cost))) {

        query.where("total_cost", ">=", form.data.min_total_cost * 100);
      }
    
      if (form.data.max_total_cost !== undefined && !isNaN(parseFloat(form.data.max_total_cost))) {
       
        query.where("total_cost", "<=", form.data.max_total_cost * 100);
      }

      console.log("id ===", form.data.email);
      if (form.data.email) {
        query.query("join", "customers", "customers.id", "customer_id").where("email", "like", `%${form.data.email}%`);
      }

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

        return order.orderStatus.order_status !== "Paid";
      });
      const successful = orderlist.toJSON().filter((order) => {
        return order.orderStatus.order_status === "Paid";
      });
      const numberFound = orderlist.toJSON().length;
      console.log("order num=>", numberFound);
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
      const numberFound = orderlist.toJSON().length;
      console.log("order num=>", numberFound);
      console.log("show success", successful);
      res.render("orders/index", {
        form: form.toHTML(bootstrapField),
        numberFound,
        resultsNum,
        pending,
        successful,
      });
    },
    error: async (form) => {
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
      const numberFound = orderlist.toJSON().length;
      console.log("order num=>", numberFound);
      console.log("show success", successful);
      res.render("orders/index", {
        form: form.toHTML(bootstrapField),
        numberFound,
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
  const orderItems = await serviceLayer.getOrderItemByOrderId(req.params.order_id);
  const statusUpdateForm = createStatusForm(await serviceLayer.getAllStatuses());

  statusUpdateForm.fields.order_status_id.value = order.get("order_status_id");

  res.render("orders/items_order", {
    order: order.toJSON(),
    orderItems: orderItems.toJSON(),
    form: statusUpdateForm.toHTML(bootstrapField),
  });
});

router.post("/:order_id/update", async (req, res) => {
  const orderId = req.params.order_id;
  //const order = await serviceLayer.getOrderByOrderId(orderId);
  const orderStatus = await serviceLayer.getAllStatuses();

  // Process update order form
  const orderForm = createStatusForm({
    orderStatus,
  });
  orderForm.handle(req, {
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

module.exports = router;
