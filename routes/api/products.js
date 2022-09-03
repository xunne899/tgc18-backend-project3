const express = require("express");
const router = express.Router();

const dataLayer = require("../../dal/products");

// #1 import in the Product model
const { Product } = require("../../models");

router.get("/", async (req, res) => {
  try {
    const products = await dataLayer.getAllProducts();
    res.send(products);
  } catch {
    res.sendStatus(500);
  }
});



router.post("/", async (req, res) => {
  

  const query = Product.collection();

  if (req.body.name) {
    query.where("name", "like", "%" + req.body.name + "%");
  }
  if (req.body.min_shelf_life) {
    query.where("shelf_life", ">=", req.body.min_shelf_life.toString());
  }
  if (req.body.max_shelf_life) {
    query.where("shelf_life", "<=", req.body.max_shelf_life.toString());
  }
  if (req.body.type_id && req.body.type_id != "0") {
    query.where("type_id", "=", req.body.type_id);
  }
  if (req.body.country_id && req.body.country_id != "0") {
    query.where("country_id", "=", req.body.country_id);
  }
  if (req.body.packaging_id && req.body.packaging_id != "0") {
    query.where("packaging_id", "=", req.body.packaging_id);
  }

  
  if (req.body != undefined) {
    if (req.body.cuisine_style) {

      query.query("join", "cuisine_styles_products", "products.id", "product_id").where("cuisine_style_id", "in", req.body.cuisine_style.split(","));
    }

    if (req.body.ingredient) {
   
      query.query("join", "ingredients_products", "products.id", "product_id").where("ingredient_id", "in", req.body.ingredient.split(","));
    }
  }
  

  if (req.body.vegan == "Yes") {
    query.where("vegan", "=", "Yes");
  }

  if (req.body.vegan == "No") {
    query.where("vegan", "=", "No");
  }
  if (req.body.halal == "Yes") {
    query.where("halal", "=", "Yes");
  }

  if (req.body.halal == "No") {
    query.where("halal", "=", "No");
  }
  const products = await query.fetch({
    withRelated: ["type", "country", "packaging", "cuisine_styles", "ingredients", "variants"],
  });
  res.send(products);
});


router.get("/types", async (req, res) => {
  const types = await dataLayer.getAllTypes();
  res.send(types);
});

router.get("/countries", async (req, res) => {
  const countries = await dataLayer.getAllCountries();
  res.send(countries);
});

router.get("/ingredients", async (req, res) => {
  const ingredients = await dataLayer.getAllIngredients();
  res.send(ingredients);
});

router.get("/packagings", async (req, res) => {
  const packagings = await dataLayer.getAllPackagings();
  res.send(packagings);
});

router.get("/cuisine_styles", async (req, res) => {
  const cuisine_styles = await dataLayer.getAllCuisineStyles();
  res.send(cuisine_styles);
});

router.get("/sizes", async (req, res) => {
  const sizes = await dataLayer.getAllSizes();
  res.send(sizes);
});

router.get("/spiciness", async (req, res) => {
  const spiciness = await dataLayer.getAllSpiciness();
  res.send(spiciness);
});


router.get("/:product_id/variant", async (req, res) => {
  const product = await dataLayer.getProductByID(req.params.product_id);
  const variants = await dataLayer.getVariantsByProductId(req.params.product_id);
  res.send({
    product,
    variants,
  });
});

module.exports = router;
