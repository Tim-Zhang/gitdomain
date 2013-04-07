var http = require('http')
  ,director = require('director');
  
  var port = 3000;

  var router = new director.http.Router();
  router.get('/notify/:id', notify);

  function notify(id) {
    this.res.writeHead(200, { 'Content-Type': 'text/plain' })
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
