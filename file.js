var fs = require('fs');
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
      git.gitclone(id, rep, callback);
    }
  });
}

var process_domain = function(id) {
  fs.readdir(path(id), function(err, files) {
    var domains = _.filter(files, function(f) {
      return f.charAt(0) !== ".";
    });
    _.each(domains, function() {
    
    });
  })
}

var get_records = function(id, domain_name) {
  var filename = path(id) + "/" + domain_name;
  var records = fs.readFileSync(filename, 'utf8');
  return records;
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


  //record.record_type = type;
  //record.sub_domain = infos[0];
  //record.value = infos[1];
  //if (infos.length < 3 ) {
  //  record.record_line = '默认';
  //  return record;
  //} else {
  //  record.record_line = infos[2];
  //}
  //switch(type) {
  //  case 'a': 
  //    break;
  //  case 'cname': 
  //    break;
  //  case 'mx': 
  //    break;
  //  case 'ns': 
  //    break;
  //} 
}


//test 

//process_domain(123);

//process_record(123, 'dnsgit.com.lua');

var lua = 'a("mail", "1.2.3.4 ", "默认" , "120")';
var ar = analyse(lua);
var record = gen_record.apply(this, ar);
console.log(ar);
console.log(record);


