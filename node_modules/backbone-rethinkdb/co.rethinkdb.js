module.exports = function(config) {
  // When installing co-rethinkdb for an application that uses the same version
  // of rethinkdb, they share the same installation of rethinkdb:
  // - your application
  //  |- node_modules
  //    |- rethinkdb
  //    |- co-rethinkdb
  //    |- * no node_modules/rethinkdb because it uses the parent one
  //
  // Therefore, the following workaround is used to not overwrite the parents
  // rethinkdb behavior.

  config = config || { host: 'localhost', port: 28015, db: 'test' }

  var toReset = ['rethinkdb', 'rethinkdb/ast', 'rethinkdb/net', 'rethinkdb/cursor'].map(function(name) {
    return require.resolve(name)
  })

  // remove parts of rethinkdb from cache
  var cache = toReset.map(function(path) {
    var cache = require.cache[path]
    delete require.cache[path]
    return cache
  })

  var r = require('rethinkdb')
  var IterableResult = require('rethinkdb/cursor').Cursor.__super__.constructor

  // restore cache
  toReset.forEach(function(path, i) {
    require.cache[path] = cache[i]
  })

  var co = require('co');
  var thunkify = require('thunkify');

  // Object, most of rethinkdb's objects inherit from
  var RDBOp = r.table('mock').constructor.__super__.constructor

  // the original run method
  var run = RDBOp.prototype.run

  // Adding a `.then()` method to the object returned by, .e.g., `r.table('...')`
  // makes `co` to recognize these objects as promises, making the `.then()`
  // method the perfect place to execute the `.run()` method instead.

  RDBOp.prototype.then = function() {
    if (!this._promise) {
      var query = this, conn;

      this._promise = co(function*() {
        conn = yield r.getConnection
        return yield run.call(query, conn)
      })

      this._promise.then(function(result) {
        r.releaseConnection(conn)
      }).catch(function(err) {
        conn && r.releaseConnection(conn)
      })
    }

    return this._promise.then.apply(this._promise, arguments)
  }

  // Wrap the original `.each()` method.
  var each = IterableResult.prototype._each
  IterableResult.prototype._each = function(cb, finished) {
    if (finished) return each.call(this, cb, finished)
    else return each.bind(this, cb)
  }

  r.getConnection = function*() {
    var connect = thunkify(r.connect);
    return yield connect( config )
  }

  r.releaseConnection = function ( conn ) {
    conn.close();
  }

  return r;
}
