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

// if (form.data.name) {
//     query.where("name", "like", "%" + form.data.name + "%");
//   }

//   if (form.data.min_shelf_life) {
//     query.where("shelf_life", ">=", form.data.min_shelf_life);
//   }

//   if (form.data.max_shelf_life) {
//     query.where("shelf_life", "<=", form.data.max_shelf_life);
//   }

//   if (form.data.type_id && form.data.type_id != "0") {
//     query.where("type_id", "=", form.data.type_id);
//   }
//   if (form.data.country_id && form.data.country_id != "0") {
//     query.where("country_id", "=", form.data.country_id);
//   }
//   if (form.data.packaging_id && form.data.packaging_id != "0") {
//     query.where("packaging_id", "=", form.data.packaging_id);
//   }
//   if (form.data.cuisine_style) {
//     // first arg: sql clause
//     // second arg: which table?
//     // third arg: one of the keys
//     // fourth arg: the key to join with
//     // eqv. SELECT * from products join products_tags ON
//     //              products.id = product_id
//     //              where tag_id IN (<selected tags ID>)
//     // this method looks for OR
//     query.query("join", "cuisine_styles_products", "products.id", "product_id").where("cuisine_style_id", "in", form.data.cuisine_style.split(","));
//   }
//   if (form.data.vegan == "Yes") {
//     query.where("vegan", "=", "Yes");
//   }

//   if (form.data.vegan == "No") {
//     query.where("vegan", "=", "No");
//   }
//   if (form.data.halal == "Yes") {
//     query.where("halal", "=", "Yes");
//   }

//   if (form.data.halal == "No") {
//     query.where("halal", "=", "No");
//   }

// #2 - fetch all the products (ie, SELECT * from products)
// const products = await query.fetch({
//   withRelated: ["type", "country", "packaging", "cuisine_styles", "ingredients"],
// });

router.post("/", async (req, res) => {
  // try {
  //   const query = Product.collection()
  //   if (Object.keys(req.body).length === 0) {
  //       const products = await query.fetch({
  //           withRelated: ["type", "country", "packaging", "cuisine_styles", "ingredients", 'variants']
  //       })
  //       res.send(products)
  //   }
  //   else if (Object.keys(req.body).length != 0) {

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
      // first arg: sql clause
      // second arg: which table?
      // third arg: one of the keys
      // fourth arg: the key to join with
      // eqv. SELECT * from products join products_tags ON
      //              products.id = product_id
      //              where tag_id IN (<selected tags ID>)
      // this method looks for OR
      query.query("join", "cuisine_styles_products", "products.id", "product_id").where("cuisine_style_id", "in", req.body.cuisine_style.split(","));
    }

    if (req.body.ingredient) {
      // first arg: sql clause
      // second arg: which table?
      // third arg: one of the keys
      // fourth arg: the key to join with
      // eqv. SELECT * from products join products_tags ON
      //              products.id = product_id
      //              where tag_id IN (<selected tags ID>)
      // this method looks for OR
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
//     } catch {
//         res.sendStatus(500)
//     }

// })

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

// router.get('/types', async (req, res) => {
//     try {
//         const types = await dataLayer. getAllTypes()
//         res.send(materials)
//     } catch {
//         res.sendStatus(500)
//     }
// })
router.get("/:product_id/variant", async (req, res) => {
  const product = await dataLayer.getProductByID(req.params.product_id);
  const variants = await dataLayer.getVariantsByProductId(req.params.product_id);
  res.send({
    product,
    variants,
  });
});

module.exports = router;
