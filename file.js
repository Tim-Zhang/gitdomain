var fs = require('fs');
fs.exists = fs.exists || require('path').exists;
var _ = require('underscore');
var git = require('./git');

var base_dir = git.base_dir;

var path = function(id) {
  return base_dir + id;
}
var gitdir_exists = function(id, callback) {
  fs.exists(path(id), callback);
};

var updatefile = function(id, rep, callback) {
  gitdir_exists(id, function(exists) {
    if (exists) {
      git.gitpull(id, callback);
    } else {
      git.gitclone(rep, id, callback);
    }
  });
}

var process_domain = function(id, callback) {
  fs.readdir(path(id), function(err, files) {
    var domains = _.filter(files, function(f) {
      return f.charAt(0) !== ".";
    });
    callback(domains);
  })
}

var get_records = function(id, domain_name, callback) {
  var filename = path(id) + "/" + domain_name;
  var records = fs.readFile(filename, 'utf8', function(err, data) {
    if (!err) {
      var records = data.split("\n"); 
      records = _.filter(records, function(r) {
        return r.trim();
      });
      callback(records);
    } else {
      console.log(err); 
    } 
  } );
}

var analyse = function(line) {
  line = line.toUpperCase().replace(/['"]/g, '');
  var p_start = line.indexOf("(");
  var p_end = line.indexOf(")");
  var type = line.slice(0, p_start);
  var infos = line.slice(p_start + 1, p_end).split(',');
  infos = _.map(infos, function(i) {
    return i.trim();
  });
  return [type, infos] 
}

var gen_record = function(type, infos) {
  var record = {};
  var model = ['sub_domain', 'value', 'record_type', 'ttl', 'mx'];
  record.type = type;

  _.each(model, function(m, i) {
    infos[i] && (record[m] = infos[i]);
  });
  return record;

}

// exports
exports.updatefile = updatefile;
exports.process_domain = process_domain;
exports.get_records = get_records;
exports.analyse = analyse;
exports.gen_record = gen_record;





//test 

//process_domain(123);

//process_record(123, 'dnsgit.com.lua');

//var lua = 'a("mail", "1.2.3.4 ", "默认" , "120")';
//var ar = analyse(lua);
//var record = gen_record.apply(this, ar);
//console.log(ar);
//console.log(record);

//gitdir_exists(123, function() {
//  console.log('has callback');
//});

