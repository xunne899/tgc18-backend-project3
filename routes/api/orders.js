const express = require('express')
const router = express.Router()
const { getOrderByCustomerId } = require('../../dal/orders')


router.get('/', async (req, res) => {
    try {      
        const orders = await getOrderByCustomerId(req.customer.customer_id)
        res.send(orders)
    } catch {
        res.sendStatus(500)
    }

})

module.exports = router