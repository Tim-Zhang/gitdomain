// Helper

var querystring = require('querystring')
  , S           = require('string')
  , _           = require('underscore')
  , _s          = require('underscore.string')
  , request     = require('request')
  , fs          = require('fs-extra')
  , thunkify    = require('thunkify')
  , crypto      = require('crypto')


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

var getFormData = function(access_token, extend) {
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

var validRecord = function(record) {
  return (record && typeof record === "object" && _.size(record) > 2);
}

var validDomain = function(domain) {
  var conditions = [
    domain.charAt(0) !== '.',
    domain.toLowerCase() !== 'readme.md'
  ];
  return _.every(conditions, function(c) {return c});
}

var bodyParser = function(body, key) {
  body = JSON.parse(body);
  if (body.error) {
    throw body;
  }
  var success, success_pool;
  if (key == 'domains') {
    success_pool = ['1', '9'];
  } else if (key == 'records') {
    success_pool = ['1', '10'];
  }
  success = body.status && _.contains(success_pool, body.status.code);
  if (success) {
    return body[key];
  } else {
    return -1;
  }
}

var uniqRecord = function(r1, r2) {
  if (!r1 || !r2) return;
  var r1_ret = _.clone(r1), r2_ret = _.clone(r2);
  var map = {
    sub_domain: 'name',
    value: 'value',
    record_type: 'type',
    ttl: 'ttl',
    mx: 'mx'
  }
  //priority
  r1 = _.sortBy(r1, function(r) {
    return _.size(r);
  })

  var exists = [];
  for (var i=0; i<r1.length; i++) {
    var is_equal;
    for (var j=0; j<r2.length; j++) {
      var rr1 = r1[i]
      var rr2 = r2[j]
      is_equal = _.every(_.keys(map), function(m) {
        var cmp1 = rr1[m];
        var cmp2 = rr2[map[m]];
        return cmp1 === undefined || cmp2 === undefined || filterV(cmp1) == filterV(cmp2);
      });
      if (is_equal) {
        break;
      }
    }
    if (is_equal) {
      r1_ret = _.without(r1_ret, rr1);
      r2_ret = _.without(r2_ret, rr2);
    }
  }

  return [r1_ret, r2_ret];
}

var removeNs = function(record) {
   return _.filter(record, function(r) {
    return !(r.type == 'NS' && r.name == '@')
  });

};

var filterV = function(v) {
  var v = v.toLowerCase();
  v = _s.trim(v, '.');
  return v;
};


var GDFS = {
  readdir: function() {
    return thunkify(fs.readdir).apply(fs, arguments);
  },
  exists: function(path) {
    return new Promise(function(resolve, reject) {
        fs.exists(path, function(exists) {
            resolve(exists);
        })
    });
  },
  readFile: function() {
    return thunkify(fs.readFile).apply(fs, arguments);
  },
  remove: function() {
    return thunkify(fs.remove).apply(fs, arguments);
  }
}

var md5 = function( d ) {
  var md5sum = crypto.createHash('md5');
  return md5sum.update(d).digest('hex');
}

var GDRequest = function* () {
    var args = _.extend([], arguments);
    return new Promise(function(resolve, reject) {
        args.push(function(error, response, body) {
            if (error || body.error) {
                console.log('--d-saf-asf-saf-');
                reject(error || body);
            } else {
                resolve(body);
            }
        });
        request.apply(null, args)
    });
}

module.exports = {
  getFormData   : getFormData,
  getParam      : getParam,
  bodyParser    : bodyParser,
  uniqRecord    : uniqRecord,
  removeNs      : removeNs,
  validDomain   : validDomain,
  validRecord   : validRecord,
  fs            : GDFS,
  md5           : md5,
  request       : GDRequest
}
