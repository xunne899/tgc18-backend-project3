const express = require("express");
const router = express.Router();

// #1 import in the Product model
const {Product,Variant} = require('../models')

router.get('/', async (req,res)=>{
    // #2 - fetch all the products (ie, SELECT * from products)
    let products = await Product.collection().fetch({
        withRelated:['type','country', 'packaging','cuisine_styles', 'ingredients']
    });
    // let variants= await Variant.collection().fetch({
    //     withRelated:['product','spiciness', 'size']
    // });


    // let variants = await Variant.collection().fetch();
    // let types = await Type.collection().fetch();
    // let sizes = await Size.collection().fetch()
    res.render('products/index', {
        'products': products.toJSON() ,
        // 'variants': variants.toJSON(),
        // #3 - convert collection to JSON
      
    })
})

module.exports = router;