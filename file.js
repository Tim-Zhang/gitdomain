var fs = require('fs');
var git = require('./git');
var _ = require('./underscore');

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
    console.log(domains);
  })
}

var process_record = function(id, domain_name) {
  var filename = path(id) + "/" + domain_name;
  var records = fs.readFileSync(filename, 'utf8');
  console.log(records);
}


//test 

//process_domain(123);

process_record(123, 'dnsgit.com.lua');
