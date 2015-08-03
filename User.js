var Backbone = require('backbone-rethinkdb')
  , CONFIG = require('./Config')

module.exports = Backbone.Model.extend({
    database: CONFIG.DATABASE,
    table: CONFIG.TABLE.USER,
    filterId: 'did'
});
