var http = require('http')
  , director = require('director')
  , db = require('./db')
  , core = require('./core');
  
  var port = 10000;

  var router = new director.http.Router();
  router.get('/notify/:id', notify);

  function notify(id) {
    this.res.writeHead(200, { 'Content-Type': 'text/plain' })
    db.getUser(id, function(err, doc) {
      var user = doc[0];

      if (user && user.gitrep && user.access_token)  {
        core.dnspod(id, user.gitrep, user.lastrep, user.access_token); 
        console.log(id, ': done');
      }
    }); 
    this.res.end(id);
  }

  var server = http.createServer(function (req, res) {
    router.dispatch(req, res, function (err) {
      if (err) {
        res.writeHead(404);
        res.end();
      }
    });
  });


server.listen(port);
console.log("Server running at :" + port);
