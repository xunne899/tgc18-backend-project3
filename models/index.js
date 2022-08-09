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
    products : function () {
      return this.belongsToMany('Product');
    }
   
  });

  const Cuisine_style = bookshelf.model('Cuisine_style', {
    tableName: 'cuisine_styles',
    products : function () {
      return this.belongsToMany('Product');
    }
   
  });


  const Spiciness = bookshelf.model('Spiciness',{
    tableName:'spiciness',
    variants: function(){
      return this.hasMany('Variant')
    }
  })

  const Size = bookshelf.model('Size',{
    tableName:'sizes',
    variants: function(){
      return this.hasMany('Variant')
    }
  })

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

  module.exports = { Product, Type, Ingredient, Cuisine_style, Variant, Size, Spiciness };