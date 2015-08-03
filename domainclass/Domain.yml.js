var Domain = require( '../Domain' )
  , yaml   = require('js-yaml')
  , _      = require('underscore')
  , Record = require('../Record')
  , GD     = require('../GD')

module.exports = Domain.extend({
  serialize: function() {

  }
  , deserialize: function* () {
    console.log('domain.yml.deserialize')
    var fullFilename = this.getFullFilename();

    var content = yield GD.fs.readFile(fullFilename, 'utf8')
    var records = yaml.safeLoad(content);
    this.localRecords.reset(records);

  }
}, {
    ext: 'yml'
});
