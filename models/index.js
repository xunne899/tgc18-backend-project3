const bookshelf = require('../bookshelf');

const Product = bookshelf.model('Product', {
  tableName: 'products',
  type : function () {
    return this.belongsTo('Type');
  },
  ingredients: function () {
    return this.belongsToMany('Ingredient');
  },
  cuisine_styles: function () {
    return this.belongsToMany('Cuisine_style');
  },
  variants: function () {
    return this.hasMany('Variant');
  },
});


const Type = bookshelf.model('Type', {
    tableName: 'types',
     products : function () {
      return this.hasMany('Product');
    }
   
  });

  
const Ingredient = bookshelf.model('Ingredient', {
    tableName: 'ingredients',
    ingredients : function () {
      return this.belongsToMany('Ingredient');
    }
   
  });

  const Cuisine_style = bookshelf.model('Cuisine_style', {
    tableName: 'cuisine_styles',
    cuisine_styles : function () {
      return this.belongsToMany('Cuisine_style');
    }
   
  });


  const Variant = bookshelf.model('Variant', {
    tableName: 'variants',
    product : function () {
      return this.belongsTo('Product');
    },
    spiciness : function () {
        return this.belongsTo('Spiciness');
      },
      size : function () {
        return this.belongsTo('Size');
      }
   
  });

  module.exports = { Product, Type, Ingredient, Cuisine_style };