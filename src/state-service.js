'use strict';
var State = require('ampersand-state');
var Collection = require('ampersand-collection');


var StateState = State.extend({
  idAttributes: 'id',
  props: {
    archetypeName: 'string',
    typeName: 'string'
  },
  session: {
    id: 'string',
    instance: 'state'
  }
});


var StateService = Collection.extend({
  model: StateState,

  mainIndex: StateState.prototype.idAttributes,

  archetypes: {},

  register: function(archetypeName, Archetype) {
    if (this.archetypes[archetypeName]) throw new Error('Archetype ' + archetypeName + ' is already registered');
    Archetype.types = Archetype.types || {};
    this.archetypes[archetypeName] = Archetype;
  },

  registerType: function(archetypeName, typeName, extend) {
    if (!this.archetypes[archetypeName]) throw new Error('Archetype ' + archetypeName + ' is not registered');
    if (this.archetypes[archetypeName].types[typeName]) throw new Error('Type ' + typeName + ' of archetype ' + archetypeName + ' is already registered');
    this.archetypes[archetypeName].types[typeName] = this.archetypes[archetypeName].extend(extend);
  },

  instanciate: function(archetypeName, attributes, options) {
    attributes = attributes || {};
    options = options || {};
    var types = this.archetypes;
    var Archetype = types[archetypeName];
    var type = attributes[Archetype.prototype.typeAttribute || 'type'];

    function create() {
      var Archetype = types[archetypeName];
      if (!type || !Archetype.types[type]) {
        return new Archetype(attributes, options);
      }

      return new Archetype.types[type](attributes, options);
    }

    var instance = create();
    this.add({
      id: instance.cid,
      instance: instance,
      // pristine: instance.toJSON(),
      archetypeName: archetypeName,
      typeName: type
    });
    return instance;
  },

  clone: function(instanceOrCid) {
    var rec;
    if(typeof instanceOrCid === 'string'){
      rec = this.get(instanceOrCid);
    }
    else if(typeof instanceOrCid.cid === 'string'){
      rec = this.get(instanceOrCid.cid);
    }
    else {
      for (var i = 0; i < this.models.length; i++) {
        if (instanceOrCid === this.models[i].instance) rec = this.models[i];
      }
    }

    var original = rec.instance;
    this.instanciate(rec.archetypeName, original.toJSON(), {
      cloneOf: original
    });
  },

  destroy: function(instanceOrCid) {
    console.info('destroy', instanceOrCid);
  }
});
module.exports = new StateService();