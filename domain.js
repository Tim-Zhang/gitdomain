var Backbone = require( 'backbone-rethinkdb' )
  , _        = require('underscore')
  , Record   = require('./Record')

var __domainClass = {};
var __defaultExt = 'yml';

var RecordCollection = Backbone.Collection.extend({
  model: Record
});

module.exports = Backbone.Model.extend({
  idAttribute: 'name'
  , __isNew: false

  , initialize: function(models, options) {
    this.onlineRecords = new RecordCollection()
    this.localRecords = new RecordCollection()

    this.localRecords.domain = this.onlineRecords.domain = this
    this.localRecords.api = this.onlineRecords.api = _.bind(this.api, this)
  }

  , user: function() {
    return this.collection.user;
  }

  , api: function() {
    return this.collection.api;
  }

  , perform: function* () {
    console.log('Domain perform start')
    yield this.deserialize();
    yield this.fetch();

    this.diff();

    yield this.removeR();
    yield this.createR();
    console.log('Domain perform done')

  }

  , diff: function() {
    var that = this;
    this.localRecords.each(function(lr) {
      var or = that.onlineRecords.get(lr.id)
      if ( or ) {
          lr.set('id', or.get('id'))
          that.onlineRecords.remove(or);
      }
    });
    this.ignoreHoldRecords();
  }

  // DNSPod Logic
  // Ignore initial NS records like 'f1g1ns1.dnspod.net.'
  , ignoreHoldRecords: function() {
    var needRemove = []

    this.onlineRecords.each(function(record) {
      if (record.get('hold') === 'hold') needRemove.push(record)
    });

    this.onlineRecords.remove(needRemove)
  }

  , serialize: function() {

  }

  , deserialize: function* () {

  }

  , fetch: function* () {
    try{
    onlineRecords = yield this.api().listRecord(this.get('id'));
  }catch(e) {
    console.log(this.attributes)
    console.log( 'listRecord exception:', e )
  }
    this.onlineRecords.reset(onlineRecords);
  }

  , create: function* () {
    if ( !this.isNew() ) return;
    createInfo = yield this.api().createDomain(this.get('name'));
    this.set('id', createInfo.id);
    this.unsetNew();
    return createInfo;
  }

  , remove: function* () {
    return yield this.api().removeDomain(this.id);
  }

  , createR: function* () {
    return yield this.localRecords.invoke('create');
  }

  , removeR: function* () {
    return yield this.onlineRecords.invoke('remove');
  }

  , isNew: function() {
    return this.__isNew;
  }

  , setNew: function() {
    this.__isNew = true;
  }

  , unsetNew: function() {
    this.__isNew = false;
  }

  , getFullFilename: function() {
    return this.get('path') + '/' + this.get('filename');
  }


}, {
    ext: null
  , extend: function(protoProps, staticProps) {
    var child = Backbone.Collection.extend.apply(this, arguments);
    this.register(staticProps.ext, child);
    return child;
  }

  , register: function(ext, obj) {
    __domainClass[ext] = obj;
  }

  , findClass: function(ext) {
    return __domainClass[ext];
  }

  , isValid: function(name) {
    var conditions = [
        name.charAt(0) !== '.',
        name.toLowerCase() !== 'readme.md'
    ];
    return _.every(conditions, function(c) {return c});
  }

  , getPureDomain: function(name) {
    return name.slice(0, name.lastIndexOf('.'));
  }

  , findClassByDomainName: function(name) {
    var ext = this.getExt(name);
    var extClass = this.findClass(ext);
    if (!extClass) extClass = this.findClass(__defaultExt);
    return extClass;
  }

  , getExt: function(name) {
    return name.split('.').pop();
  }

});
