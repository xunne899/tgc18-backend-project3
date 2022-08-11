const bookshelf = require('../bookshelf');

const Product = bookshelf.model('Product', {
  tableName: 'products',
  type () {
    return this.belongsTo('Type');
  },
  country () {
    return this.belongsTo('Country');
  },
  packaging() {
    return this.belongsTo('Packaging');
  },
  ingredients() {
    return this.belongsToMany('Ingredient');
  },
  cuisine_styles() {
    return this.belongsToMany('Cuisine_style');
  },
  variants() {
    return this.hasMany('Variant');
  },
});


const Type = bookshelf.model('Type', {
    tableName: 'types',
     products () {
      return this.hasMany('Product');
    }
   
  });

  const Country = bookshelf.model('Country', {
    tableName: 'countries',
     products () {
      return this.hasMany('Product');
    }
   
  });

  const Packaging = bookshelf.model('Packaging', {
    tableName: 'packagings',
     products () {
      return this.hasMany('Product');
    }
   
  });
  
const Ingredient = bookshelf.model('Ingredient', {
    tableName: 'ingredients',
    products () {
      return this.belongsToMany('Product');
    }
   
  });

  const Cuisine_style = bookshelf.model('Cuisine_style', {
    tableName: 'cuisine_styles',
    products() {
      return this.belongsToMany('Product');
    }
   
  });


  const Spiciness = bookshelf.model('Spiciness',{
    tableName:'spiciness',
    variants(){
      return this.hasMany('Variant')
    }
  })

  const Size = bookshelf.model('Size',{
    tableName:'sizes',
    variants(){
      return this.hasMany('Variant')
    }
  })

  const Variant = bookshelf.model('Variant', {
    tableName: 'variants',
    product () {
      return this.belongsTo('Product');
    },
    spiciness () {
        return this.belongsTo('Spiciness');
      },
    size () {
        return this.belongsTo('Size');
      }
   
  });


  const User = bookshelf.model('User',{
    tableName:'users'
  })
  module.exports = { Product, Type, Ingredient, Cuisine_style, Variant, Size, Spiciness, Packaging, Country, User };