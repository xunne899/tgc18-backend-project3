'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.createTable('ingredients_products', {
      id: { type: 'int', primaryKey: true, autoIncrement: true },
      product_id: {
          type: 'int',
          notNull: true,
          unsigned: true,
          foreignKey: {
              name: 'products_ingredients_product_fk',
              table: 'products',
              rules: {
                  onDelete: 'CASCADE',
                  onUpdate: 'RESTRICT'
              },
              mapping: 'id'
          }
      },
      ingredient_id: {
          type: 'int',
          notNull: true,
          unsigned:true,
          foreignKey: {
              name: 'products_ingredients_ingredient_fk',
              table: 'ingredients',
              rules: {
                  onDelete: 'CASCADE',
                  onUpdate: 'RESTRICT'
              },
              mapping: 'id'
          }
      }
  });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
