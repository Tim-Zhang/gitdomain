var http = require('http')
  , director = require('director')
  , db = require('./db')
  , core = require('./core');
  
  var port = 10000;

  var router = new director.http.Router();
  router.post('/notify/:id', notify);

  function notify(id) {
    this.res.writeHead(200, { 'Content-Type': 'text/plain' })
    if (!/^GitHub\sHookshot/.test(this.req.headers['user-agent'])) {
       console.info('access not from github');
       this.res.end('github only');
    } else {
       db.getUser(id, function(err, doc) {
         var user = doc[0];

         if (user && user.gitrep && user.access_token)  {
           core.dnspod(id, user.gitrep, user.lastrep, user.access_token); 
         }
       }); 
       this.res.end(id + ': done');
    }
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
