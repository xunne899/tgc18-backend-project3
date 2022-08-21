
const express = require("express");
const router = express.Router();

const dataLayer = require("../dal/products");

// #1 import in the Product model
const { Product } = require("../models");



router.get('/', async (req, res) => {
    try {
        const products = await dataLayer.getAllProducts()
        res.send(products)
    } catch {
        res.sendStatus(500)
    }

})

router.get("/:product_id/variant", async (req, res) => {
    const product = await dataLayer.getProductByID(req.params.product_id);
    const variants = await dataLayer.getVariantsByProductId(req.params.product_id);
    res.send({
        product,
        variants
    });
  });

  module.exports = router