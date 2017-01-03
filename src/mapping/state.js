(function(global) {
  'use strict';
  var State = global.VFDeps.State;
  var Collection = global.VFDeps.Collection;

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
















  var MappingState = State.extend({
    mappable: {source: [], target: []},

    props: {
      sourceObject: ['state', true, null],
      sourceProperty: ['string', true, null],

      targetObject: ['state', false, null],
      targetProperty: ['string', false, null],

      transformation: ['any', false, null]
    },

    session: {
      uiState: {
        type: 'string',
        values: ['', 'dependency', 'dependent', 'focus', 'highlighted'],
        default: '',
        required: true
      }
    },

    derived: {
      sourcePath: {
        deps: ['sourceObject', 'sourceProperty'],
        fn: function() {
          var objPath = objectPath(this.sourceObject);
          return (objPath ? objPath + '.' : '') + this.sourceProperty;
        }
      },
      sourceValue: {
        deps: ['sourceObject', 'sourceProperty'],
        fn: function() {
          return this.sourceObject.get(this.sourceProperty);
        }
      },
      sourceObjectType: {
        deps: ['sourceValue'],
        fn: function () {
          return typeof this.sourceValue;
        }
      },

      transformationFunction: {
        deps: ['transformation'],
        fn: function () {
          var noop = function(val){ return val; };

          var fn;
          if (typeof this.transformation === 'function') {
            fn = this.transformation.bind(this);
          }
          else if (typeof this.transformation === 'string') {
            try {
              // not pretty
              eval('fn = ' + this.transformation + ';');
            }
            catch (e) {
              // not pretty
              console.warn(e);
              fn = noop;
            }
          }
          else {
            fn = noop;
          }

          return fn;
        }
      },
      targetPath: {
        deps: ['targetObject', 'targetProperty'],
        fn: function() {
          if (!this.targetObject || !this.targetProperty) return null;
          var objPath = objectPath(this.targetObject);
          return (objPath ? objPath + '.' : '') + this.targetProperty;
        }
      },
      targetValue: {
        deps: ['sourceValue', 'targetObject', 'targetProperty', 'transformationFunction'],
        fn: function() {
          if (!this.targetObject || !this.targetProperty) return null;
          return this.transformationFunction.call(this, this.sourceValue);
        }
      }
    },

    objectPath: function(state) {
      return objectPath(state);
    },

    resolve: function(path, context) {
      return resolve(path, context || this.collection.context);
    },

    initialize: function(attrs) {
      if (!attrs.sourceObject || !attrs.sourceProperty) throw new Error('Missing sourceObject information');
      this.listenToAndRun(this, 'change:targetValue', this.sourceValueChange);
      this.listenToAndRun(this.sourceObject, 'all', function(evtName) {
        if (evtName === 'change:' + this.sourceProperty) {
          this.trigger('change:sourceProperty');
        }
      });
    },

    sourceValueChange: function() {
      if (!this.targetObject || !this.targetProperty) return;
      // console.info('%c%s => %s changed %s => %s', 'color:purple;', this.sourcePath, this.targetPath, this.sourceValue, this.targetValue, this.targetObject);
      this.targetObject.set(this.targetProperty, this.targetValue);
    }
  });



















  var _mappings = new (Collection.extend({
    model: MappingState,

    // has problem with  'id = targetObjectProto._derived[this.mainIndex].fn.call(attrs);' in ampersand-collection
    // mainIndex: 'targetPath',// ensure uniqueness?

    lookup: function(coords, whom) {
      whom = !whom ? 'sourceObject' : 'targetObject';
      return _mappings.filter(function(state) {
        return state[whom + 'Path'] === coords;
      });
    },

    resolve: function(path, context) {
      return resolve(path, context || this.context);
    },

    objectPath: function(state) {
      return objectPath(state);
    },

    isTarget: function(state, propName) {
      var p = objectPath(state);
      p = (p ? p + '.' : '') + propName;
      return this.models.find(function(mapping) {
        return mapping.targetPath === p;
      });
    },

    isSource: function(state, propName) {
      var p = objectPath(state) + propName;
      return this.models.find(function(mapping) {
        return mapping.sourcePath === p;
      });
    },

    sourceSuggestions: function(origin) {
      var results = [];
      if (!origin || typeof origin !== 'object') return results;

      var kepts = [];
      if (origin.mappable && origin.mappable.source) {
        kepts = (origin.mappable.source || []);
      }

      function filterKeys(key) {
        var excluded = [
          'mappable',
          'parent',
          'collection',
          origin.idAttribute,
          origin.typeAttribute
        ];
        return excluded.indexOf(key) < 0 && kepts.indexOf(key) > -1;
      }

      var proto = origin.constructor && origin.constructor.prototype ? origin.constructor.prototype : {};
      var propNames = Object.keys(proto._definition || {});
      var derivedNames = Object.keys(proto._derived || {});
      var childNames = Object.keys(proto._children || {});
      var collectionNames = Object.keys(proto._collections || {});

      propNames.concat(derivedNames, childNames)
        .filter(filterKeys)
        .forEach(function(key) {
          var sub = this.sourceSuggestions(origin[key]);
          if (!sub.length) {
            if (childNames.indexOf(key) < 0) {
              results.push(key);
            }
            return;
          }

          results = results.concat(sub.map(function(name) {
            return key + '.' + name;
          }));
        }, this);

      collectionNames
        .filter(filterKeys)
        .forEach(function(collectionName) {
          origin[collectionName].forEach(function(model) {
            var id = model.getId();
            var suggestions = this.sourceSuggestions(model);
            results = results.concat(suggestions.filter(function(v) { return !!v; }).map(function(name) {
              return collectionName + '.' + id + '.' + name;
            }));
          }, this);
        }, this);

      return results;
    },

    targetSuggestions: function(origin) {
      var results = [];
      if (!origin || typeof origin !== 'object') return results;

      var kepts = [];
      if (origin.mappable && origin.mappable.target) {
        kepts = (origin.mappable.target || []);
      }

      function filterKeys(key) {
        var excluded = [
          'mappable',
          'parent',
          'collection',
          origin.idAttribute,
          origin.typeAttribute
        ];
        return excluded.indexOf(key) < 0 && kepts.indexOf(key) > -1;
      }

      var proto = origin.constructor && origin.constructor.prototype ? origin.constructor.prototype : {};
      var propNames = Object.keys(proto._definition || {});
      var childNames = Object.keys(proto._children || {});
      var collectionNames = Object.keys(proto._collections || {});

      propNames.concat(childNames)
        .filter(filterKeys)
        .forEach(function(key) {
          var sub = this.targetSuggestions(origin[key]);
          if (!sub.length) {
            if (childNames.indexOf(key) < 0) {
              results.push(key);
            }
            return;
          }

          results = results.concat(sub.map(function(name) {
            return key + '.' + name;
          }));
        }, this);

      collectionNames
        .filter(filterKeys)
        .forEach(function(collectionName) {
          origin[collectionName].forEach(function(model) {
            var id = model.getId();
            var suggestions = this.targetSuggestions(model);
            results = results.concat(suggestions.filter(function(v) { return !!v; }).map(function(name) {
              return collectionName + '.' + id + '.' + name;
            }));
          }, this);
        }, this);

      return results;
    },

    import: function(data, context) {
      context = context || this.context;
      if (!context) throw new Error('mappings.import() requires a context');

      this.add(data.map(function(item) {
        var source = item.source.split('.');
        var target = item.target.split('.');

        return {
          sourceObject: this.resolve(source.slice(0, -1).join('.'), context) || context,
          sourceProperty: source.pop(),
          targetObject: this.resolve(target.slice(0, -1).join('.'), context) || context,
          targetProperty: target.pop(),
          transformation: item.transform
        };
      }, this));
    },

    export: function() {
      return this.map(function(item) {
        return {
          source: item.sourcePath,
          target: item.targetPath,
          transform: (item.transformation || '').toString()
        };
      });
    },

    remove: function(models) {
      models = Array.isArray(models) ? models : [models];

      models.forEach(function(modelOrId) {
        var model = typeof modelOrId === 'string' ? this.get(modelOrId) : modelOrId;
        if (!model) {
          console.info('could not determine the model for', modelOrId);
          return;
        }
        model.stopListening();
      }, this);

      return Collection.prototype.remove.apply(this, arguments);
    }
  }))();

  module.exports = _mappings;
})(typeof window !== 'undefined' ? window : self);