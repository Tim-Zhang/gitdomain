var Backbone = require( 'backbone-rethinkdb' ),
    _        = require('underscore'),
    GD       = require('./GD')

module.exports = Backbone.Model.extend({
    idAttribute: 'gid',

    defaults: {
        name: '',
        type: 'A',
        line: '默认',
        value: '',
        mx  : 5,
        ttl : 600
    },

    constructor: function(attr, options) {
        // Uppercase type
        attr.type = attr.type.toUpperCase()

        attr.gid = this.getId(attr)
        Backbone.Model.apply(this, arguments);
    },

    initialize: function(attributes, options) {
        //options && (this.domain = options.domain);
        this.on('change', this.setId, this);
    },

    validate: function() {
        return null;
    },

    getId: function(attr) {
        attr = attr || this.attributes

        var seq = [ 'name', 'type', 'line', 'value', 'MX', 'ttl' ]
           , idString = ''
           , that = this;

        _.each(seq, function(key) {
            if ( key === 'MX' && attr.type !== 'MX' ) return;

            idString += attr[key];
        });

        return GD.md5(idString);
    },

    setId: function() {
      Backbone.Model.prototype.set.call( this, {gid: this.getId()} );
    },

    toJSON: function() {
        var json = {
            domain_id   : this.domain().get('id'),
            sub_domain  : this.get('name'),
            record_type : this.get('type'),
            record_line : this.get('line'),
            value       : this.get('value'),
            mx          : this.get('mx'),
            ttl         : this.get('ttl')
        }

        if ( this.get('type') !== 'MX' ) {
            delete json.mx;
        }

        return json;
    }

    , api: function() {
        return this.collection.api();
    }
    , domain: function() {
        return this.collection.domain;
    }

    , create: function* () {
        if (this.get('id')) return;

        try {
        createInfo = yield this.api().createRecord(this.toJSON());
        } catch(e) {
            console.log(e)
        }
        this.set('id', createInfo.id)

        return createInfo;
    },

    remove: function* () {
        removeInfo = yield this.api().removeRecord(this.domain().get('id'), this.get('id'));
        this.destroy();
        return removeInfo;
    },

    info: function() {

    }

});
