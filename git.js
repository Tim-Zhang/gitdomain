var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var base_dir = '/tmp/dnsgit/';

exports.base_dir = base_dir;
exports.gitclone = function(addr, id, callback) {
  var gitclone = spawn('git', ['clone', addr, id], { cwd: base_dir, env: process.env});
  gitclone.on('close', function (code) {
    if (code === 0) {
      callback();
    } else {
      console.log('git pull error code:' + code);
    }
  });
}

exports.gitpull = function(id, callback) {
  var dir = base_dir + id;
  var gitpull = spawn('git', ['pull'], { cwd: dir, env: process.env});
  console.log('gitpull start');
  gitpull.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  gitpull.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });
  gitpull.on('exit', function (code) {
      console.log('gitpull done');
    if (code === 0) {
      console.log('gitpull done');
      callback();
    } else {
      console.log('git pull error code:' + code);
    }
  });
}


//test
//var tc = function () {
//  console.log('done');
//};
//
////exports.gitclone('https://github.com/zewenzhang/luadns.git', 123, tc);
//exports.gitpull(123, tc);
