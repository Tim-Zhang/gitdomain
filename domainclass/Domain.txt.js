var Domain = require( '../Domain' )

module.exports = Domain.extend({
    name: '',
    serialize: function() {

    },
    deserialize: function* () {
        var fullFilename = this.path + '/' + this.get('filename');

        var content = yield GD.fs.readFile(fullFilename, 'utf8')

        var records = data.split("\n");

        records = _.filter(records, function(r) {
            return r.trim();
        });
        callback(null, records);

    }
}, {
    ext: 'txt',
});
