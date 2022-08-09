// Setting up the database connection
const knex = require('knex')({
    client: 'mysql',
    connection: {
      user: 'admin',
      password:'owner',
      database:'spice_sauce'
    }
  })
  const bookshelf = require('bookshelf')(knex)
  
  module.exports = bookshelf;