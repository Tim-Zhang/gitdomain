var Backbone = require( 'backbone-rethinkdb' ),
    _        = require('underscore'),
    CONFIG   = require('./Config'),
    exec     = require('child_process').exec,
    spawn    = require('child_process').spawn,
    fs       = require('fs-extra'),
    GD       = require('./GD'),
    Domains  = require('./Domains'),
    nodegit  = require("nodegit")


module.exports = Backbone.Model.extend({
    repo: null,

    initialize: function(attr, options) {
    },

    user: function() {
        return this.get('user');
    },

    isNew: function* () {
        console.log(this.path())
        pathExists = yield GD.fs.exists(this.path());
        if (!pathExists) return true;

        var repo = yield this.open();
        var remote = yield repo.getRemote('origin');
        if (remote.url() !== this.user().get('repoUrl')) {
            yield GD.fs.remove(this.path());
            return true;
        }

        return false;

    },

    path: function() {
        return CONFIG.REPO.BASEDIR + this.user().get('did');
    },

    validateUser: function() {
        var user = this.user();
        return user.get('accessToken');
    },

    open: function* () {
        if (this.repo) return this.repo;

        var that = this;
        return nodegit.Repository.open(that.path()).then(function(repo) {
            that.repo = repo;
            return repo;
        });
    },

    pull: function* () {
        var repo = yield this.open();
        yield repo.fetchAll({
          credentials: function(url, userName) {
              return nodegit.Cred.sshKeyFromAgent(userName);
          },
          certificateCheck: function() {
              return 1;
          }
        });

        var commit = yield repo.getBranchCommit('origin/master');
        yield nodegit.Reset.reset(repo, commit, nodegit.Reset.TYPE.HARD)

        console.log('Git Pull Done!');

        return commit.sha();

    },

    clone: function* () {
        var user = this.user()
          , opts = {remoteCallbacks: {certificateCheck: function() {return 1;}}}
          , repo = yield nodegit.Clone(user.get('repoUrl'), this.path(), opts)

        var commit = yield repo.getBranchCommit('origin/master');
        return commit.sha();
    },

    perform: function* () {
        var commitId = yield this.fetch()
          , domainnames = yield this.getDomainsByFilename()
          , domains = new Domains(domainnames, { user: this.user(), path: this.path(), commitId: commitId })

        yield domains.perform();
    },

    getDomainsByFilename: function* () {
        return yield GD.fs.readdir(this.path());
    },

    // git clone or git pull
    // return commit id
    fetch: function* () {
        if (!this.validateUser()) {
            throw new Error('User does not exist or invalid.');
            return;
        }
        if ( yield this.isNew() ) {
            console.log('isNew')
            yield this.clone()
        } else {
            console.log('isOld');
            yield this.pull()
        }
    }

});
