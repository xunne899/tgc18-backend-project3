
const express = require('express');
const router = express.Router();
const OrderServices = require('../../services/order_services');
const { bootstrapField, createStatusForm, createOrderSearchForm } = require('../../forms');
const { getUserByEmail } = require('../../dal/users')
const { Order } = require('../../models')


router.get('/', async (req, res) => {
    const orderServices = new OrderServices()
    const orderSearchForm = createOrderSearchForm(await orderServices.getAllStatuses())
    const q = Order.collection()
    orderSearchForm.handle(req, {
        empty: async (form) => {
            const orders = await q.fetch({
                withRelated: ['variants', 'user', 'status', 'address']
            })
            const resultsCount = orders.toJSON().length
            const pending = orders.toJSON().filter(order => {
                return order.status.status_name !== 'Delivered/Completed'
            })
            const completed = orders.toJSON().filter(order => {
                return order.status.status_name === 'Delivered/Completed'
            })
            res.render('orders/index', {
                orderSearchForm: form.toHTML(bootstrapField),
                resultsCount,
                pending,
                completed
            })
        },
        error: async (form) => {
            const orders = await q.fetch({
                withRelated: ['variants', 'user', 'status', 'address']
            })
            const resultsCount = orders.toJSON().length
            const pending = orders.toJSON().filter(order => {
                return order.status.status_name !== 'Delivered/Completed'
            })
            const completed = orders.toJSON().filter(order => {
                return order.status.status_name === 'Delivered/Completed'
            })
            res.render('orders/index', {
                orderSearchForm: form.toHTML(bootstrapField),
                resultsCount,
                pending,
                completed
            })
        },
        success: async (form) => {
            if (form.data.order_id) {
                q.where('order_id', '=', form.data.order_id)
            }
            if (form.data.email) {
                const user = await getUserByEmail(form.data.email)
                if (user) {
                    q.where('user_id', '=', user.get('user_id'))
                } else {
                    q.where('user_id', '=', '0')
                }
            }
            if (form.data.order_date) {
                q.where('order_date', '=', form.data.order_date)
            }
            if (form.data.status_id) {
                q.where('status_id', '=', form.data.status_id)
            }
            const orders = await q.fetch({
                withRelated: ['variants', 'user', 'status', 'address']
            })
            const resultsCount = orders.toJSON().length
            const pending = orders.toJSON().filter(order => {
                return order.status.status_name !== 'Delivered/Completed'
            })
            const completed = orders.toJSON().filter(order => {
                return order.status.status_name === 'Delivered/Completed'
            })
            res.render('orders/index', {
                orderSearchForm: form.toHTML(bootstrapField),
                resultsCount,
                pending,
                completed
            })
        }
    })
})

router.get('/:order_id/items', async (req, res) => {
    const orderServices = new OrderServices(req.params.order_id)
    const order = await orderServices.getOrderByOrderId()
    const orderItems = await orderServices.getOrderItemsByOrderId()
    const statusForm = createStatusForm(await orderServices.getAllStatuses())

    statusForm.fields.status_id.value = order.get('status_id')

    res.render('orders/order-items', {
        order: order.toJSON(),
        orderItems: orderItems.toJSON(),
        statusForm: statusForm.toHTML(bootstrapField)
    })
})

router.post('/:order_id/status/update', async (req, res) => {
    const orderServices = new OrderServices(req.params.order_id)
    await orderServices.updateOrderStatus(req.body.status_id)
    req.flash('success_messages', 'Order status changed.')
    res.redirect(`/orders/${req.params.order_id}/items`)
})

router.get('/:order_id/delete', async (req, res) => {
    const orderServices = new OrderServices(req.params.order_id)
    const order = await orderServices.getOrderByOrderId()
    if (order.toJSON().status.status_name === 'Delivered/Completed') {
        req.flash('error_messages', 'Completed orders cannot be deleted.')
        res.redirect('/orders')
    } else {
        res.render('orders/delete', {
            order: order.toJSON()
        })
    }
})

router.post('/:order_id/delete', async (req, res) => {
    const orderServices = new OrderServices(req.params.order_id)
    await orderServices.deleteOrder()
    req.flash('success_messages', 'Order has been deleted.')
    res.redirect('/orders')
})

module.exports = router