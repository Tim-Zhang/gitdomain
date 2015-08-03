module.exports = function(config) {
    return {
        Model: require('./backbone.rethinkdb.model')(config),
        Collection: require('./backbone.rethinkdb.collection')(config)
    }
}
module.exports.Model = require('./backbone.rethinkdb.model')();
module.exports.Collection = require('./backbone.rethinkdb.collection')();
