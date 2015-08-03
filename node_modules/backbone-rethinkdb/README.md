Backbone-RethinkDB
===========================
## What is this?
A Backbone version syncing with rethinkdb.
just use it like normal Backbone, the only difference is syncing(replace ajax to rethinkdb)

## Usage

```
var co = require('co')
  , _ = require('underscore')
  , BackboneRdb = require('backbone-rethinkdb');

var User = BackboneRdb.Model.extend({
    database: 'test',
    table: 'user'
});

var Users = BackboneRdb.Collection.extend({
    database: 'test',
    table: 'user'
});

co(function* () {

    // Create Model
    var user = new User({name: 'Lilei', age: 18, sex: 'male'})
    yield user.save();

    // Fetch Model
    var id = user.id
      , user2 = new User({id: id});

    yield user2.fetch();

    // Modify Model
    yield user.save({age: 19});

    // Delete Model
    yield user.destroy();

    // Fetch Collection
    var users = new Users();
    yield users.fetch({orderBy: 'createTime', start: 0, length: 100});

    // Count Table
    var count = yield users.count();


}).catch(function(error) { console.error(error); });

```

## Compatibility
- node >= 0.11.13
- use `node --harmony`

## Testing
`npm test`

```
Create/Fetch Model is OK.
Modify Model is OK.
Collection is OK.
====== Everthing is OK. ======
```
