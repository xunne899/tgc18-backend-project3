

const {  Product, Type, Country, Ingredient, Packaging, Cuisine_style, Size, Spiciness, Variant } = require("../models");

async function getAllTypes() {
    const types = await Type.fetchAll().map((type) => {
        return [type.get("id"), type.get("type")];
      });
  return types
}


async function getAllCountries() {
    const countries = await Country.fetchAll().map((country) => {
        return [country.get("id"), country.get("country")];
      });
  return countries
}


async function getAllIngredients() {
  const ingredients = await Ingredient.fetchAll().map((ingredient) => {
    return [ingredient.get("id"), ingredient.get("ingredient")];
  });
  return ingredients
}

async function getAllPackagings() {
  const packagings = await Packaging.fetchAll().map((packaging) => {
    return [packaging.get("id"), packaging.get("packaging")];
  });
  return packagings
}

async function getAllCuisineStyles() {
  const cuisine_styles = await Cuisine_style.fetchAll().map((cuisine_style) => {
    return [cuisine_style.get("id"), cuisine_style.get("cuisine_style")];
  });
  return cuisine_styles
}


async function getAllSizes() {
  const sizes = await Size.fetchAll().map((size) => {
    return [size.get("id"),size.get("size")];
  });
  return sizes
}

async function getAllSpiciness() {
  const spiciness = await Spiciness.fetchAll().map((spiciness) => {
    return [spiciness.get("id"),spiciness.get("spiciness")];
  });
  return spiciness
}

const getProductByID = async (productId) => {
    return await Product.where({
        'id': parseInt(productId)
    }).fetch({
        require: true,
        withRelated: ["type", "country", "packaging","cuisine_styles", "ingredients"]
    });
}

async function getAllProducts() {
    return await Product.fetchAll({
        withRelated:["type", "country", "packaging", "cuisine_styles", "ingredients","variants"]
    });
}

const getVariantsByProductId = async (productId) => {
  return await Variant.where({
      product_id: parseInt(productId)
  }).fetchAll({
      require: false,
      withRelated: ['product', 'size', 'spiciness']
  })
}

const getVariantById = async (variantId) => {
  return await Variant.where({
      'id': parseInt(variantId)
  }).fetch({
      require: true,
      withRelated: ['product','size', 'spiciness']
  })
}

module.exports = {
    getAllTypes, getAllCountries, getAllIngredients, getAllPackagings, getAllSizes, getAllSpiciness, getAllCuisineStyles, getAllProducts, getProductByID, getVariantsByProductId, getVariantById
}