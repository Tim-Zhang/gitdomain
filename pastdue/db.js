var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost/dnsgit');

var schema = mongoose.Schema({ id: 'string', gitrep: 'string', access_token: 'string', lastrep: 'string'});
var User = db.model('User', schema);

exports.getUser = function(id, callback) {
  User.find({id: id}, callback);
};

exports.updateLastRep = function(id, lastrep, callback) {
  var set = {lastrep: lastrep};
  console.log(lastrep);
  User.update({id: id}, {$set: set}, callback);
};


// test

//var testUser = exports.getUser(586691, function(err, doc) {
//  console.log(doc);
//  process.exit();
//});
//

//exports.updateLastRep(586691,'123' ,function() {
//  console.log('fuck');
//});
