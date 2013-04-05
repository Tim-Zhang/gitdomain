var mongoose = require('mongoose');
var db = mongoose.createConnection('mongodb://localhost/dnsgit');

var schema = mongoose.Schema({ id: 'string', gitrep: 'string', access_token: 'string'});
var User = db.model('User', schema);

exports.getUser = function(id, callback) {
  User.find({id: id}, callback);  
};


// test

var testUser = exprts.getUser(586691);
console.log(testUser);



