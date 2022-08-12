

const {  Product, Type, Country, Ingredient, Packaging, Cuisine_style } = require("../models");

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

const getProductByID = async (productId) => {
    return await Product.where({
        'id': parseInt(productId)
    }).fetch({
        require: true,
        withRelated: ["cuisine_styles", "ingredients"]
    });
}

async function getAllProducts() {
    return await Product.fetchAll({
        withRelated:["type", "country", "packaging", "cuisine_styles", "ingredients"]
    });
}



module.exports = {
    getAllTypes, getAllCountries, getAllIngredients, getAllPackagings, getAllCuisineStyles, getAllProducts ,getProductByID
}