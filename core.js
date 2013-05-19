var _ = require('underscore') 
  , async = require('async')
  , file = require('./file')
  , util = require('./util') 
  , domain = require('./domain') 
  , record = require('./record');


var domain_create = function(domains, access_token, callback) {
  var success_domain = [];
  var times = domains && domains.length || 0;
  var oneback = _.after(times, function() {
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

var records_create = function(records, access_token, callback) {
  if (records && records.length) {
    _.each(records, function(r) {
      record.create(r, access_token, function(err, res, body) {
        console.info('record create...');
        callback(err);
        console.info(err || body);
        if (err) {
          //TODO 
          //weixin notice
        }
      });
    });
  } else {
    callback(null); 
  }
};

var records_remove = function(domain_id, record_ids, access_token, callback) {
  var times = record_ids && record_ids.length || 0;
  var oneback = _.after(times, function() {
    callback(); 
  });
  _.each(record_ids, function(id) {
    record.remove(domain_id, id, access_token, function(err, res, body) {
      console.info('record remove..');
      console.info(err || body);
      if (err) {
        //TODO 
        //weixin notice
      }
      oneback();
    });
  })
  
};

var record_handle_factory = function(id, access_token) {
  return function(d, main_callback) {
      var records;
      async.waterfall([
        // get records from file
        function(callback) {
          file.get_records(id, d.name, function(err, lines) {
            callback(err, lines);
          })
        },
        // get records online
        function(lines, callback) {
          records = gen_records(lines, d.id);
          record.list(d.id, access_token, function(err, res, body) {
            callback(err, body);
          });
        },
        // remove records
        function(body, callback) {
          var records_ol = util.bodyParser(body, 'records');
          if (records_ol !== -1) {
            records = util.removeNs(records);
            records_ol = util.removeNs(records_ol);
            var uniq_result = util.uniqRecord(records, records_ol);
            records = uniq_result[0];
            records_ol = uniq_result[1];
            var records_ol_ids = _.pluck(records_ol, 'id');
            records_remove(d.id, records_ol_ids, access_token, function() {
              callback(null);
            });
          }
        },
        // create records
        function(callback) {
          records_create(records, access_token, callback);  
        }
          
      ], function(err, result) {
        main_callback(err, result);
      });

  };
}
var records_handle = function(id, access_token, success_domain, callback) {
  console.info('records handleing...');
  var record_handle = record_handle_factory(id, access_token);
  async.map(success_domain, record_handle, function(err, result) {
    callback(err, result);
  });

};

var domains_handle = function(id, access_token, callback) {
  var domains, success_domain;
  console.info('domains handleing...');
  async.waterfall([
    // get domains from file
    function(callback) {
      file.process_domain(id, function(err, file_domains) {
        domains = file_domains;
        callback(null);
      });
    },
    // get domains online
    function(callback) {
      domain.list(access_token, function(err, res, body) {
        try {
          var body_domains = util.bodyParser(body, 'domains');
          callback(null, body_domains, body);
        } catch(err) {
          callback(err);
        }
      });
    },
    // create and remove domains
    function(body_domains, body, callback) {
      if (body_domains !== -1) {
        var domains_ol, domains_ol_obj, more, less, intersection;
        if (body_domains) {
          domains_ol = _.pluck(body_domains, 'name');
          domains_ol_obj = _.object(domains_ol, body_domains);
          more = _.difference(domains_ol, domains);
          less = _.difference(domains, domains_ol);
          intersection = _.intersection(domains, domains_ol);
        } else {
          more = [];
          less = domains;
        }

        var mother_callback = callback;
        async.parallel([
          function(callback) {
            domain_create(less, access_token, function(sd) {
              success_domain = sd;
              _.extend(success_domain, body_domains);
              _.filter(success_domain, function(s) {
                return _.contains(intersection, s.name);
              });
              callback(null);
            });
          },
          function(callback) {
            var domain_ids = _.pluck(_.pick(domains_ol_obj, more), 'id');
            domain_remove(domain_ids, access_token);
            callback(null);
          }
        ], function(err, res) {
          mother_callback(err, res);
        });


      } else {
        callback(null, body);
      }
    }
  ], function(err, result) {
    callback(err, id, access_token, success_domain);
  });
};

exports.dnspod = function(id, rep, lastrep, access_token) {
  async.waterfall([
    function(callback) {
      file.updatefile(id, rep, lastrep, function() {
        callback(null, id, access_token);
      });
    },
    domains_handle,
    records_handle
      
  ], function(err, res) {
    if (err) {
      console.info('******** main process has an error ********');
      console.info(err);
      console.info('******** main process has an error ********');
    } else {
      console.info('******** [id:' + id + '] operation has all done ********');
    }
  });

};


//test
//

//var at = '20ddf7ef6b23ce36508d24c83671338297a82217';
//exports.dnspod(586691, 'https://github.com/zewenzhang/dnsgit-demo.git', 'https://github.com/zewenzhang/dnsgit-demo.git', at);

