var _ = require('underscore') 
  , file = require('./file')
  , util = require('./util') 
  , domain = require('./domain') 
  , record = require('./record');

var domain_handle = function(id, access_token, callback) {
  file.process_domain(id, function(domains) {
    domain.list(access_token, function(err, res, body) {
      var body_domains = util.bodyParser(body, 'domains');
      if (body_domains !== -1) {
        var domains_ol = _.pluck(body_domains, 'name');
        var domains_ol_obj = _.object(domains_ol, body_domains);
        var more = _.difference(domains_ol, domains);
        var less = _.difference(domains, domains_ol);

        domain_create(less, access_token, function(success_domain) {
          _.extend(success_domain, body_domains);
          console.log(id, success_domain);
          callback(success_domain);
        });
        var domain_ids = _.pluck(_.pick(domains_ol_obj, more), 'id');
        domain_remove(domain_ids, access_token);
      } else {
        console.log(body);
      }
    });
  
  });

};
var domain_create = function(domains, access_token, callback) {
  var success_domain = [];
  var oneback = _.after(domains.length, function() {
    callback(success_domain); 
  });

  _.each(domains, function(d) {
    domain.create(d, access_token, function(err, res, body) {
      body = JSON.parse(body);
      if (!err && body && body.status && body.status.code == 1) {
        body.domain.name = body.domain.domain;
        success_domain.push(body.domain);
      } else {
        //TODO
        //weixin notice on error
      }
      oneback(); 
    });
  });
}

var domain_remove = function(domain_ids, access_token, callback) {
  _.each(domain_ids, function(id) {
    domain.remove(id, access_token, function(err, res, body) {
      console.log(body);
      //TODO
      //weixin notice on error
    });
  });
}

var gen_records = function(lines, domain_id) {
  var records = [];
  _.each(lines, function(line) {
    var line_ana = file.analyse(line);
    var record = file.gen_record.apply(this, line_ana);
    record.domain_id = domain_id;
    records.push(record);
  })
  return records;
};

var records_create = function(records, access_token) {
  _.each(records, function(r) {
    record.create(r, access_token, function(err, res, body) {
      if (err) {
        //TODO 
        //weixin notice
      }
    });
  })
};

var records_remove = function(domain_id, record_ids, access_token) {
  _.each(record_ids, function(id) {
    record.remove(domain_id, id, access_token, function(err, res, body) {
      if (err) {
        //TODO 
        //weixin notice
      }
    });
  })
  
};

var records_handle = function(id, success_domain, access_token, callback) {
  _.each(success_domain, function(d) {   
    file.get_records(id, d.name, function(lines) {
      var records = gen_records(lines, d.id);
      record.list(d.id, access_token, function(err, res, body) {
        var records_ol = util.bodyParser(body, 'records');
        if (records_ol !== -1) {
          var more = _.difference(records_ol, records);
          var less = _.difference(records, records_ol);
          //records_create(less, access_token);
          console.log(records_ol);

        }
      
      });
      
    });
  });

};

var record_handle = function(records, domain_id) {

};

var main = function(id, rep, access_token) {
  file.updatefile(id, rep, function() {
    domain_handle(id, access_token, function(success_domain) {
      records_handle(id, success_domain, access_token, function() {
      
      });
    });

  });
};

//test
//

var at = 'cb6d1f9c0ff9ce21bf477f6bc9d1026d5c9d7655';
main(123, 'https://github.com/zewenzhang/dnsgit-test.git', at);

