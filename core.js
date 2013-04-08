var _ = require('underscore') 
  , file = require('./file')
  , domain = require('./domain') 
  , record = require('./record');

var main = function(id, rep) {
  file.updatefile(id, rep, function() {
    console.log('update success');
    file.process_domain(id, function(domains) {
      _.each(domains, function(d) {
        file.get_records(id, d, function(records) {
          console.log(records);
          _.each(records, function(r) {
            console.log(file.analyse(r));
          });
        });
      });
    });
  });
};

//test
//

main(123, 'https://github.com/zewenzhang/dnsgit-test.git');
