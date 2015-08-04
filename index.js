// Prerequire modules for register class for domain
require('./prerequire');

var koa         = require('koa'),
    kr          = require('koa-route');
    app         = koa(),
    router      = require('koa-route')
    User        = require('./User')
    Repo        = require('./Repo')

// app.use(function* () {
//     if (!/^GitHub\sHookshot/.test(this.headers['user-agent'])) {
//         console.info('403', 'Forbidden');
//         this.status = 403;
//         return;
//     }
//
//
//     yield* next;
// });

app.use(kr.get('/hook/:id', hook));

function* hook(id) {
    var user = new User({ did: id });
    yield user.fetch();
    yield new Repo({ user: user }).perform();
    this.status = 200;
}


/* Listen Port */
app.listen(10000); // 7860 -> run0
console.log('[' + app.env + '] Listen :' + 10000);
