var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var base_dir = '/tmp/dnsgit/';

exports.base_dir = base_dir;
exports.gitclone = function(addr, id, callback) {
  var gitclone = spawn('git', ['clone', addr, id], { cwd: base_dir, env: process.env});
  gitclone.on('close', function (code) {
    if (code === 0) {
      callback();
    }
  });
}

exports.gitpull = function(id, callback) {
  var dir = base_dir + id;
  var gitpull = spawn('git', ['pull'], { cwd: dir, env: process.env});
  gitpull.on('close', function (code) {
    if (code === 0) {
      callback();
    }
  });
}


//test
var tc = function () {
  console.log('done');
};

//exports.gitclone('https://github.com/zewenzhang/luadns.git', 123, tc);
exports.gitpull(123, tc);
