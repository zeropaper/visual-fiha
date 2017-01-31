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

function isCollectionOfParent(o, p) {
  if (!p || !p._collections) return;
  for (var name in p._collections) {
    if (p[name] === o.collection) return name + '.' + o.getId();
  }
}

function isChildOfParent(o, p) {
  if (!p || !p._children) return;
  for (var name in p._children) {
    if (p[name] === o) return name;
  }
}

function isPropOfParent(o, p) {
  if (!p) return;
  for (var name in p) {
    if (p[name] === o) return name;
  }
}


function objectPath(state) {
  if (!state) return null;
  var parts = [];


  var f = function(instance) {

    var collectionName = instance.collection ?
                      isCollectionOfParent(instance, instance.collection.parent) :
                      null;
    if (collectionName) {
      parts.unshift(collectionName);
      return f(instance.collection.parent);
    }

    var childName = isChildOfParent(instance, instance.parent);
    if (childName) {
      parts.unshift(childName);
      return f(instance.parent);
    }


    var propName = isPropOfParent(instance, instance.parent);
    if (propName) {
      parts.unshift(propName);
      return f(instance.parent);
    }

    if (instance.parent) f(instance.parent);
  };

  f(state);

  return parts.join('.');
}


function resolve(path, context) {
  if (!context) throw new Error('Missing context to solve mapping path');

  function solver(str) {
    var parts = str.split('.');

    var f = function(instance) {
      if (!parts.length) return instance;

      var part = parts.shift();
      if (instance[part] && instance[part].isCollection) {
        return f(instance[part].get(parts.shift()));
      }
      else if (typeof instance[part] !== 'undefined') {
        return f(instance[part]);
      }
    };
    return f;
  }

  return solver(path)(context);
}

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
  }
});

StateService.resolve = resolve;
StateService.objectPath = objectPath;

var instance;
StateService.service = function() {
  if (instance) return instance;
  instance = new StateService();
  return instance;
};

module.exports = StateService;
