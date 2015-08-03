var Backbone = require('backbone-rethinkdb')
  , _        = require('underscore')
  , Domain   = require('./Domain')
  , GD       = require('./GD')
  , Api      = require('./api/DNSPod.js')


var DomainCollection = Backbone.Collection.extend({
  model: Domain
});

var Domains = Backbone.Collection.extend({
  model: Domain
  , constructor: function(filenames, options) {
    this._reset();

    var validFilenames = _.filter(filenames, function(name) { return Domain.isValid(name) });
    var models = _.map( validFilenames, function(name) {
      domainClass = Domain.findClassByDomainName(name)
      domainName = Domain.getPureDomain(name);
      return new domainClass({
          name: domainName
        , path: options.path
        , filename: name
      });
    });

    this.initialize.call(this, models, options);
    if (models) this.reset(models, _.extend({silent: true}, options));
  }

  , initialize: function(models, options) {
    this.onlines = new DomainCollection()
    _.extend(this, _.pick(options, 'user', 'path', 'commitId'));
    this.api = this.onlines.api = new Api({accessToken: this.user.get('accessToken')});
  }

  , perform: function* () {
    yield this.fetch();

    this.diff();

    yield this.doCreate();
    yield this.doRemove();

    yield this.performChild();
  }

  , diff: function() {
    var onlines = this.onlines, online;

    this.each(function(domain) {
      online = onlines.get(domain.id)
      if (online) {
        domain.set(online.attributes)
        online.destroy();
      } else {
        domain.setNew();
      }
    });
  }

  , doCreate: function* () {
    yield this.invoke('create');
  }

  , doRemove: function* () {
    yield this.onlines.invoke('remove');
  }

  , performChild: function* () {
    yield this.invoke('perform');
  }

  , fetch: function*() {
    console.log('do fetch...');
    try {
      onlineDomains = yield this.api.listDomain()
    } catch (e) {
      console.log('Fetch domains error: ', e);
      throw('critical error');
    }
    // console.log(onlineDomains);
    this.onlines.reset(onlineDomains);
  }


});

module.exports = Domains;
