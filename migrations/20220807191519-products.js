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
  return db.createTable('products', {
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true,
      unsigned: true,
    },
    name: {
      type: 'string',
      length: 100,
      notNull: true,
    },
    description:  {
      type: 'text',
      notNull: true,
    },
    shelf_life: {
      type: 'smallint',
      notNull: true,
    },
    vegan: {
      type: 'string',
      length: 100,
      notNull: true,
     
    },
    halal: {
      type: 'string',
      length: 100,
      notNull: true,
    },
    created_date:{
      type: 'date'
    }
  });
};

exports.down = function(db) {
  return db.dropTable('products');
};

exports._meta = {
  "version": 1
};