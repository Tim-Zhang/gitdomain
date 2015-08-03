var _        = require('underscore')
  , Backbone = require('backbone')
  , co       = require('co')
  , _r       = require('./co.rethinkdb')
  , rModel   = require('./backbone.rethinkdb.model');


module.exports = function(dbconfig) {
    dbconfig || (dbconfig = {
          host: 'localhost'
        , port: 28015
    });

    if (!dbconfig.host) dbconfig.host = 'localhost';
    if (!dbconfig.port) dbconfig.port = 28015;

    return Backbone.Collection.extend({
        host: dbconfig.host
        , database: dbconfig.db || dbconfig.database
        , port: dbconfig.port
        , table: dbconfig.table
        , model: rModel(dbconfig)

        , initialize: function( attr, options ) {
            if ( options ) {
                _.extend(this, _.pick(options, 'table', 'host', 'database', 'port'));
                options.db && ( this.database = options.db );
            }
        }

        , sync: function(method, model, options) {
            var params = { method: method };

            if (options.data == null && model && (method === 'create' || method === 'update' || method === 'patch')) {
              params.data = options.attrs || model.toJSON(options);
            }

            var xhr = options.xhr = this.ajax(_.extend(params, options));

            model.trigger('request', model, xhr, options);
            return xhr;
        }

        , count: function() {
            var db = this.database
              , table = this.table
              , r = _r({host: this.host, database: this.database, port: this.port});

            return co(function* () {
                return yield r.db(db).table(table).count()
            });
        }

        , ajax: function(params) {
            var result
            , method = params.method
            , that = this
            , table = this.table
            , db = this.database
            , start = params.start || 0
            , orderBy = params.orderBy || 'createTime'
            , length = params.length || 100
            , r = _r({host: this.host, database: this.database, port: this.port});

            return co(function* (){
                if (orderBy){
                    result = yield r.db(db).table(table).orderBy(orderBy).slice(start, length);
                } else {
                    result = yield r.db(db).table(table).limit(5);
                }

                params.success && params.success(result);
                return result;
            })

        }

    });
}