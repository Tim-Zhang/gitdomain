var Backbone    = require( 'backbone-rethinkdb' )
  , querystring = require('querystring')
  , _           = require('underscore')
  , config      = require('../Config')
  , GD          = require('../GD')

module.exports = Backbone.Model.extend({
  initialize: function(attr, options) {

  }

  , requestUrl: 'https://dnsapi.cn/'

  , genUrl: function(action) {
    return this.requestUrl + action
  }

  , genForm: function(extend) {
    var accessToken = this.accessToken();

    var form = _.extend({
      format: "json",
      access_token: accessToken
    }, extend);
    return querystring.stringify(form);
  }

  , param: function(action, extend) {
    var that = this;

    return {
      uri: that.genUrl(action),
      method: 'POST',
      body: that.genForm(extend),
      headers: {
          'content-type': 'application/x-www-form-urlencoded'
        , 'user-agent': config.AGENT
      }
    };
  }

  , accessToken: function() {
    return this.get('accessToken');
  }

  , parse: function(body, key) {
    try {
      body = JSON.parse(body);
    } catch(e) {
      throw e;
      return;
    }
    if (body.error) {
      throw body;
    }
    var success, success_pool;

    if (key == 'domains') {
      success_pool = ['1', '9'];
    } else if (key == 'records') {
      success_pool = ['1', '10'];
    } else {
      success_pool = ['1'];
    }

    success = body.status && _.contains(success_pool, body.status.code);
    if (success) {
      if (key) return body[key];

      return null
    } else {
      throw body.status;
    }
  }

  , listDomain: function* () {
    var action = 'Domain.List';
    var param = this.param(action, {type: 'all'});
    var response =  yield GD.request(param);
    return this.parse(response, 'domains');
  }

  , infoDomain: function* (domain) {
    var action = 'Domain.Info';
    var param = this.param(action, {domain: domain});
    var response =  yield GD.request(param);
    return this.parse(response, 'domain');
  }

  , createDomain: function* (domainName) {
    var action = 'Domain.Create';
    var param = this.param(action, {domain: domainName});
    var response =  yield GD.request(param);
    return this.parse(response, 'domain');
  }

  , removeDomain: function* (domainId) {
    var action = 'Domain.Create';
    var param = this.param(action, {domain_id: domainId});
    var response =  yield GD.request(param);
    return this.parse(response);
  }

  , listRecord: function* (domainId) {
    var action = 'Record.List';
    var param = this.param(action, {domain_id: domainId});
    var response =  yield GD.request(param);
    var response =  yield GD.request(param);
    return this.parse(response, 'records');
  }

  , infoRecord: function* (domain) {
    var action = 'Record.Info';
    var param = this.param(action, {domain: domain});
    var response =  yield GD.request(param);
    return this.parse(response, 'record');
  }

  , createRecord: function* (recordJson) {
    var action = 'Record.Create';
    var param = this.param(action, recordJson);
    var response =  yield GD.request(param);
    return this.parse(response, 'record');
  }

  , removeRecord: function* (domainId, recordId) {
    var action = 'Record.Remove';
    var param = this.param(action, {
      domain_id: domainId,
      record_id: recordId
    });
    var response =  yield GD.request(param);
    return this.parse(response);
  }





});
