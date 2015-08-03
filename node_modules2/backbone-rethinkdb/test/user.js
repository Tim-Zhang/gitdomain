var co = require('co')
  , _  = require('underscore')
  , r = require('../co.rethinkdb')()
  , BackboneRdb = require('../index');

var passed = 0;

// Collection
var Users = BackboneRdb.Collection.extend({
    database: 'test',
    table: 'user'
});
// Model
var User = BackboneRdb.Model.extend({
    database: 'test',
    table: 'user'
});


co(function* () {
    /* Model Test */

    // Create Database `test` and Table `user` for test.
    yield createDbTable();

    // Create User
    var user = new User({name: 'Lilei', age: 18, sex: 'male'})
    yield user.save();

    // Fetch User
    var id = user.id
      , user2 = new User({id: id});

    yield user2.fetch();

    if ( _.isEqual(user.toJSON(), user2.toJSON()) ) {
        console.log('Creating/Fetching Model is OK.');
        passed++;
    } else {
        console.error('There are some error about Model creating/fetching');
    }

    // Update User
    user.set('age', 19);
    user.unset('sex')

    yield user.save();
    yield user.fetch();

    if (user.get('name') === 'Lilei' && user.get('age') === 19 && user.get('sex') === undefined) {
        console.log('Updating Model attributes is OK.');
        passed++;
    } else {
        console.error('There are some error about Model updating');
    }


    /* Collection Test */
    var users = new Users()
    yield users.fetch();
    if (users.length > 0 && user instanceof BackboneRdb.Model) {
        console.log('Collection is OK.');
        passed++;
    } else {
        console.error('There are some error about Collection');
    }

    if (passed === 3) console.log('====== Everthing is OK. ======');

}).catch(function(error) { console.error(error); });

function* createDbTable() {
    try { yield r.dbCreate('test'); } catch(e) {} finally {
        try { yield r.tableCreate('user'); } catch(e) {}
    }
}
