var _ = require('underscore') 
  , file = require('./file')
  , domain = require('./domain') 
  , record = require('./record');

var domain_handle = function(id, access_token, callback) {
  file.process_domain(id, function(domains) {
    domain.list(access_token, function(err, res, body) {
      body = JSON.parse(body);
      var domains_online = _.values(_.pick(body, 'name'));
      console.log(domains_online);
      var less = _.difference(domains, domains_online);
    });
  
  });

};
var record_handle = function(id) {

};
var main = function(id, rep, access_token) {
  file.updatefile(id, rep, function() {
    console.log('update success');
    domain_handle(id, access_token);

  });
};

//test
//

var at = 'a411fef1b7dc48cd755a6a1dfe036c10bd437f9c';
main(123, 'https://github.com/zewenzhang/dnsgit-test.git', at);

