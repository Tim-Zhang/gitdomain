var querystring = require('querystring'),
  , S = require('string');
  , _ = require('underscore');

var getUrl = function(action, type) {
  var baseUrl = 'https://dnsapi.cn/';
  var urls = { 
    "record": {
      "create": "Record.Create",
      "remove": "Record.Remove",
      "list": "Record.List",
      "info": "Record.Info",
      "modify": "Record.Modify"
    },
    "domain": {
      "create": "Domain.Create",
      "remove": "Domain.Remove",
      "list": "Domain.List",
      "info": "Domain.Info"
    }
  };  
  if ((type in urls) && action in urls[type]) {
    return baseUrl + urls[type][action];
  } else {
    throw "type or action not in expect list";
  }
};

var getForm = function(access_token, extend) {
  var form = _.extend({
    format: "json",
    access_token: access_token
  }, extend);
  return querystring.stringify(form);
};

var getParam = function(action, type, form) {
  var params = { 
    uri: getUrl(action, type),
    method: 'POST',
    body: form,
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    }   
  };  
  return params;
};

var valid_record = function(record) {
  return (record && typeof record === "object" && _.size(record) > 2);
}

exports.getForm = getForm;
exports.getParam = getParam;


