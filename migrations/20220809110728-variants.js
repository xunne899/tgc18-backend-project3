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

exports.up = function(db) {
  return db.createTable('variants', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true,
      unsigned: true,
      notnull:true
    },
    stock: {
      type: 'int',
      notNull: true,
    },
    cost: {
      type: 'smallint',
      notNull: true,
    },
    image_url: {
      type: 'string',
      length:2048,
      notNull: true,
    },
    thumbnail_url: {
      type: 'string',
      length:2048,
      notNull: true,
    },
    product_id: {
      type: 'int',
      notNull: true,
      unsigned: true,
      foreignKey: {
        name: 'variant_product_fk',
        table: 'products',
        rules: {
          onDelete: 'cascade',
          onUpdate: 'restrict'
        },
        mapping: 'id'
      }
    },
    spiciness_id: {
      type: 'int',
      notNull: true,
      unsigned: true,
      foreignKey: {
        name: 'variant_spiciness_fk',
        table: 'spiciness',
        rules: {
          onDelete: 'cascade',
          onUpdate: 'restrict'
        },
        mapping: 'id'
      }
    },    
      size_id: {
      type: 'int',
      notNull: true,
      unsigned: true,
      foreignKey: {
        name: 'variant_size_fk',
        table: 'sizes',
        rules: {
          onDelete: 'cascade',
          onUpdate: 'restrict'
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
