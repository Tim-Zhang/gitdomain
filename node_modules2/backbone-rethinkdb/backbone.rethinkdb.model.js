var _        = require('underscore')
  , Backbone = require('backbone')
  , co       = require('co')
  , _r       = require('./co.rethinkdb')


module.exports = function(dbconfig) {
    dbconfig || (dbconfig = {
          host: 'localhost'
        , port: 28015
    });

    if (!dbconfig.host) dbconfig.host = 'localhost';
    if (!dbconfig.port) dbconfig.port = 28015;

    return Backbone.Model.extend({
          host: dbconfig.host
        , database: dbconfig.db || dbconfig.database
        , port: dbconfig.port
        , table: dbconfig.table
        , filterId: 'id'

        , initialize: function( attr, options ) {
            if ( options ) {
                _.extend(this, _.pick(options, 'table', 'filterId', 'host', 'database', 'port'));
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

        , ajax: function(params) {
            var result
            , method = params.method
            , that = this
            , table = this.table
            , db = this.database
            , r = _r({host: this.host, database: this.database, port: this.port});

            return co(function* (){
                var createdTime = Date.now();
                switch (method) {
                    case 'read':
                        if (that.id) {
                            result = yield r.db(db).table(table).get(that.id);
                        } else {
                            cursor = yield r.db(db).table(table).filter(r.row(that.filterId).eq(that.get(that.filterId)));
                            result = yield cursor.toArray();
                            result = result[0];
                        }
                        break;
                    case 'create':
                        params.data.createdTime = createdTime;
                        result = yield r.db(db).table(table).insert(params.data);
                        break;
                    case 'update':
                        result = yield r.db(db).table(table).get(that.id).replace(_.extend({id: that.id}, params.data));
                        break;
                    case 'patch':
                        result = yield r.db(db).table(table).get(that.id).update(params.data);
                        break;
                    case 'delete':
                        result = yield r.db(db).table(table).get(that.id).delete();
                        break;
                }
                if (!result || method !== 'read' && result.errors) {
                    params.error && params.error(result);
                    throw result;
                    return;
                }

                if (method === 'create') {
                    result = { id: result.generated_keys[0], createdTime: createdTime }
                } else if (_.contains(['update', 'patch'], method)) {
                    result = that.toJSON()
                }

                params.success && params.success(result);
                return result;

            })

        }


    });
}
