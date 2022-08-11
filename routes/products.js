const express = require("express");
const router = express.Router();

// #1 import in the Product model
const { Product, Type, Country, Ingredient, Packaging, Cuisine_style } = require("../models");
// import in the Forms
const { bootstrapField, createProductForm } = require("../forms");
router.get("/", async (req, res) => {
  // #2 - fetch all the products (ie, SELECT * from products)
  let products = await Product.collection().fetch({
    withRelated: ["type", "country", "packaging", "cuisine_styles", "ingredients"],
  });
  // let variants= await Variant.collection().fetch({
  //     withRelated:['product','spiciness', 'size']
  // });

  // let variants = await Variant.collection().fetch();
  // let types = await Type.collection().fetch();
  // let sizes = await Size.collection().fetch()
  res.render("products/index", {
    products: products.toJSON(),
    // 'variants': variants.toJSON(),
    // #3 - convert collection to JSON
  });
});

router.get("/create", async function (req, res) {
  const types = await Type.fetchAll().map((type) => {
    return [type.get("id"), type.get("type")];
  });

  const countries = await Country.fetchAll().map((country) => {
    return [country.get("id"), country.get("country")];
  });

  const ingredients = await Ingredient.fetchAll().map((ingredient) => {
    return [ingredient.get("id"), ingredient.get("ingredient")];
  });

  const packagings = await Packaging.fetchAll().map((packaging) => {
    return [packaging.get("id"), packaging.get("packaging")];
  });

  const cuisine_styles = await Cuisine_style.fetchAll().map((cuisine_style) => {
    return [cuisine_style.get("id"), cuisine_style.get("cuisine_style")];
  });

  const productForm = createProductForm(types, countries, ingredients, packagings, cuisine_styles);

  res.render("products/create", {
    form: productForm.toHTML(bootstrapField),
  });
});

router.post("/create", async function (req, res) {
  const types = await Type.fetchAll().map((type) => {
    return [type.get("id"), type.get("type")];
  });
  const countries = await Country.fetchAll().map((country) => {
    return [country.get("id"), country.get("country")];
  });

  const ingredients = await Ingredient.fetchAll().map((ingredient) => {
    return [ingredient.get("id"), ingredient.get("ingredient")];
  });

  const packagings = await Packaging.fetchAll().map((packaging) => {
    return [packaging.get("id"), packaging.get("packaging")];
  });

  const cuisine_styles = await Cuisine_style.fetchAll().map((cuisine_style) => {
    return [cuisine_style.get("id"), cuisine_style.get("cuisine_style")];
  });
  const productForm = createProductForm(types, countries, ingredients, packagings, cuisine_styles);
  productForm.handle(req, {
    success: async (form) => {
      const product = new Product();
      product.set("name", form.data.name);
      product.set("description", form.data.description);
      product.set("shelf_life", form.data.shelf_life);
      product.set("vegan", form.data.vegan);
      product.set("halal", form.data.halal);
      product.set("type_id", form.data.type_id);
      product.set("created_date", new Date());
      product.set("country_id", form.data.country_id);
      product.set("packaging_id", form.data.packaging_id);
      product.set("image_url", form.data.image_url);
      product.set("thumbnail_url", form.data.thumbnail_url);
      // console.log(form.data);
      await product.save();
      if (form.data.ingredient) {
        await product.ingredients().attach(form.data.ingredient.split(","));
      }
      if (form.data.cuisine_style) {
        await product.cuisine_styles().attach(form.data.cuisine_style.split(","));
      }
      req.flash("success_messages", `New Product ${product.get("name")} has been created`);
      res.redirect("/products");
    },
    error: async function (form) {
      res.render("products/create", {
        form: form.toHTML(bootstrapField),
      });
    },
  });
});

router.get("/:product_id/update", async (req, res) => {
  // retrieve the product
  const productId = req.params.product_id;
  const product = await Product.where({
    id: parseInt(productId),
  }).fetch({
    require: true,
    withRelated: ["cuisine_styles", "ingredients"],
  });

  // fetch all values
  const types = await Type.fetchAll().map((type) => {
    return [type.get("id"), type.get("type")];
  });

  const countries = await Country.fetchAll().map((country) => {
    return [country.get("id"), country.get("country")];
  });

  const ingredients = await Ingredient.fetchAll().map((ingredient) => {
    return [ingredient.get("id"), ingredient.get("ingredient")];
  });

  const packagings = await Packaging.fetchAll().map((packaging) => {
    return [packaging.get("id"), packaging.get("packaging")];
  });

  const cuisine_styles = await Cuisine_style.fetchAll().map((cuisine_style) => {
    return [cuisine_style.get("id"), cuisine_style.get("cuisine_style")];
  });

  const productForm = createProductForm(types, countries, ingredients, packagings, cuisine_styles);

  // fill in the existing values
  productForm.fields.type_id.value = product.get("type_id");
  productForm.fields.name.value = product.get("name");
  productForm.fields.country_id.value = product.get("country_id");
  productForm.fields.description.value = product.get("description");
  productForm.fields.packaging_id.value = product.get("packaging_id");
  productForm.fields.shelf_life.value = product.get("shelf_life");
  // productForm.fields.created_value.value = product.get("created_value");
  productForm.fields.vegan.value = product.get("vegan");
  productForm.fields.halal.value = product.get("halal");
  // // 1 - set the image url in the product form
  productForm.fields.image_url.value = product.get("image_url");
  productForm.fields.thumbnail_url.value = product.get("thumbnail_url");

  let selectedIngredients = await product.related("ingredients").pluck("id");
  productForm.fields.ingredient.value = selectedIngredients;
  let selectedCuisine_styles = await product.related("cuisine_styles").pluck("id");
  productForm.fields.cuisine_style.value = selectedCuisine_styles;

  res.render("products/update", {
    form: productForm.toHTML(bootstrapField),
    product: product.toJSON(),
    //   // 2 - send to the HBS file the cloudinary information
    //   cloudinaryName: process.env.CLOUDINARY_NAME,
    //   cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    //   cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
  });
});

router.post("/:product_id/update", async (req, res) => {
  // fetch all values
  const types = await Type.fetchAll().map((type) => {
    return [type.get("id"), type.get("type")];
  });

  const countries = await Country.fetchAll().map((country) => {
    return [country.get("id"), country.get("country")];
  });

  const ingredients = await Ingredient.fetchAll().map((ingredient) => {
    return [ingredient.get("id"), ingredient.get("ingredient")];
  });

  const packagings = await Packaging.fetchAll().map((packaging) => {
    return [packaging.get("id"), packaging.get("packaging")];
  });

  const cuisine_styles = await Cuisine_style.fetchAll().map((cuisine_style) => {
    return [cuisine_style.get("id"), cuisine_style.get("cuisine_style")];
  });

  // fetch the product that we want to update
  const product = await Product.where({
    id: req.params.product_id,
  }).fetch({
    require: true,
    withRelated: ["cuisine_styles", "ingredients"],
  });

  // process the form
  const productForm = createProductForm(types, countries, ingredients, packagings, cuisine_styles);
  productForm.handle(req, {
    success: async (form) => {
      let { cuisine_style, ingredient, ...productData } = form.data;
      console.log(cuisine_styles);
      product.set(productData);
      // product.set(form.data);
      product.save();
      // update the tags

      let cuisine_styleIds = cuisine_style.split(",").map((id) => parseInt(id));
      let existingCuisine_styleIds = await product.related("cuisine_styles").pluck("id");

      let ingredientIds = ingredient.split(",").map((id) => parseInt(id));
      let existingIngredientIds = await product.related("ingredients").pluck("id");

      // remove followings that aren't selected anymore
      let toRemoveCuisine = existingCuisine_styleIds.filter((id) => cuisine_styleIds.includes(id) === false);
      await product.cuisine_styles().detach(toRemoveCuisine);
      await product.cuisine_styles().attach(cuisine_styleIds);

      // remove following that aren't selected anymore
      let toRemoveIngredient = existingIngredientIds.filter((id) => ingredientIds.includes(id) === false);
      await product.ingredients().detach(toRemoveIngredient);
      await product.ingredients().attach(ingredientIds);

      res.redirect("/products");
    },
    error: async (form) => {
      res.render("products/update", {
        form: form.toHTML(bootstrapField),
        product: product.toJSON(),
      });
    },
  });
});

// router.post('/:product_id/update', async (req, res) => {

//     // fetch the product that we want to update
//     const product = await Product.where({
//         'id': req.params.product_id
//     }).fetch({
//         require: true,
//         withRelated: ["cuisine_styles","ingredients"]
//     });

//     // process the form
//     const productForm = createProductForm();
//     productForm.handle(req, {
//         'success': async (form) => {
//             product.set(form.data);
//             product.save();
//             res.redirect('/products');
//         },
//         'error': async (form) => {
//             res.render('products/update', {
//                 'form': form.toHTML(bootstrapField),
//                 'product': product.toJSON()
//             })
//         }
//     })

// })

router.get("/:product_id/delete", async (req, res) => {
  // fetch the product that we want to delete
  const product = await Product.where({
    id: req.params.product_id,
  }).fetch({
    require: true,
  });

  res.render("products/delete", {
    product: product.toJSON(),
  });
});

router.post("/:product_id/delete", async (req, res) => {
  // fetch the product that we want to delete
  const product = await Product.where({
    id: req.params.product_id,
  }).fetch({
    require: true,
  });
  await product.destroy();
  res.redirect("/products");
});

module.exports = router;
