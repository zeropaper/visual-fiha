webpackJsonp([2],{

/***/ 14:
/***/ function(module, exports, __webpack_require__) {

"use strict";

var mappings = __webpack_require__(16);
var assign = VFDeps.assign;
var Collection = VFDeps.Collection;
var State = VFDeps.State;
var View = VFDeps.View;

var PropertyView = View.extend({
  template: '<div class="columns object-prop prop-type-default">' +
    '<div class="column gutter text-right prop-name"></div>' +
    '<div class="column no-grow prop-value-reset">' +
      '<button class="vfi-cancel"></button>' +
    '</div>' +
    '<div class="column prop-value">' +
      '<input name="value" type="text" />' +
    '</div>' +
    // '<div class="column prop-mapping-path">' +
    //   '<input name="mapping" />' +
    // '</div>' +
    '<div class="column prop-mapping-clear">' +
      '<button class="vfi-unlink"></button>' +
    '</div>' +
  '</div>',

  initialize: function() {
    // should improve the performances by using the passive option
    var change = this._handleChange.bind(this);
    this.on('change:el', function() {
      if (this.previousAttributes.el) {
        this.previousAttributes.el.removeEventListener('change', change, {passive: true});
      }

      if (!this.el) return;

      this.el.addEventListener('change', change, {passive: true});
    });

    // triggers an event which will clear the derived cache for .value
    this.listenTo(this.parent.model, 'all', function(evtName) {
      if (evtName === 'change:' + this.model.name) this.trigger('change:parent.model');
    });

    /*
    this.listenToAndRun(mappings, 'all', function(evtName) {
      console.info('mappings %s in %s property view', evtName, this.model.name, this.mappingObject);
    });
    */
  },

  derived: {
    suggestionHelper: {
      cache: false,
      fn: function() {
        var view = this.parent;
        while (view) {
          if (view.suggestionHelper) return view.suggestionHelper;
          view = view.parent;
        }
        return false;
      }
    },

    value: {
      deps: [
        'model',
        'model.name',
        'parent.model'
      ],
      fn: function() {
        return this.parent.model.get(this.model.name);
      }
    },

    mappingPath: {
      deps: ['value'],
      fn: function() {
        return mappings.objectPath(this.parent.model) + this.model.name;
      }
    },

    mappingObject: {
      deps: ['mappingPath'],
      fn: function() {
        return mappings.isTarget(this.parent.model, this.model.name);
      }
    }
  },

  bindings: {
    'model.name': {
      type: 'text',
      selector: '.prop-name'
    },

    value: {
      type: function(el, val) {
        if (el === document.activeElement) return;
        el.value = val;
      },
      selector: 'input[name=value]',
    },

    mappingPath: {
      type: 'booleanAttribute',
      selector: '.prop-mapping-clear button',
      name: 'disabled',
      invert: true
    }
  },

  events: {
    'click .prop-value-reset button': '_handleReset',
    'change [name=mapping]': '_handleMappingChange',
    'focus [type=text][name=value]': '_suggestValues',
    'focus [name=mapping]': '_suggestMappings'
  },

  _handleReset: function() {
    this.parent.model.unset(this.model.name);
  },

  _handleMappingChange: function() {
    console.info('_handleMappingChange');
  },

  _suggestValues: function(evt) {
    var helper = this.suggestionHelper;
    if (!helper || !this.model.values || !this.model.values.length) return;

    var el = evt.target;
    helper.attach(el, function(selected) {
      el.value = selected;
      helper.detach();
    }).fill(this.model.values);
  },

  _suggestMappings: function(evt) {
    console.info('_suggestMappings', this.model.values, evt.target, evt.delegatedTarget);
  },

  // can not / don't want to use evt.preventDefault() here
  _handleChange: function(evt) {
    this.parent.model.set(this.model.name, evt.target.value);
  }
});



PropertyView.types = {};

PropertyView.types.boolean = PropertyView.extend({
  template: '<div class="columns object-prop prop-type-boolean">' +
    '<div class="column gutter text-right prop-name"></div>' +
    '<div class="column no-grow">' +
      '<button class="vfi-cancel"></button>' +
    '</div>' +
    '<div class="column prop-value">' +
      '<button class="prop-toggle-btn"></button>' +
    '</div>' +
    // '<div class="column prop-mapping-path">' +
    //   '<input name="mapping" />' +
    // '</div>' +
    '<div class="column prop-mapping-clear">' +
      '<button class="vfi-unlink"></button>' +
    '</div>' +
  '</div>',

  bindings: assign({}, PropertyView.prototype.bindings, {
    value: {
      selector: 'button.prop-toggle-btn',
      type: 'booleanClass',
      yes: 'vfi-toggle-on',
      no: 'vfi-toggle-off'
    }
  }),

  events: {
    'click button.prop-toggle-btn': '_handleToggle'
  },

  _handleChange: function() {},

  _handleToggle: function () {
    this.parent.model.toggle(this.model.name);
    console.info('set', this.model.name, this.parent.model.get(this.model.name), this.value);
  }
});

PropertyView.types.number = PropertyView.extend({
  template: '<div class="columns object-prop prop-type-number">' +
    '<div class="column gutter text-right prop-name"></div>' +
    '<div class="column no-grow">' +
      '<button class="vfi-cancel"></button>' +
    '</div>' +
    '<div class="column prop-value">' +
      '<input name="value" type="number" />' +
    '</div>' +
    // '<div class="column prop-mapping-path">' +
    //   '<input name="mapping" />' +
    // '</div>' +
    '<div class="column prop-mapping-clear">' +
      '<button class="vfi-unlink"></button>' +
    '</div>' +
  '</div>',

  bindings: assign({}, PropertyView.prototype.bindings, {
    min: [
      {
        selector: '[name=value]',
        type: function(el, val) {
          if (val !== null && typeof val !== 'undefined') {
            el.setAttribute('min', val);
          }
          else {
            el.removeAttribute('min');
          }
        }
      }
    ],
    max: [
      {
        selector: '[name=value]',
        type: function(el, val) {
          if (val !== null && typeof val !== 'undefined') {
            el.setAttribute('max', val);
          }
          else {
            el.removeAttribute('max');
          }
        }
      }
    ],
  }),

  session: {
    min: ['number', false, null],
    max: ['number', false, null]
  },

  _handleChange: function(evt) {
    this.parent.model.set(this.model.name, Number(evt.target.value));
  }
});









PropertyView.names = {};

PropertyView.names.active = PropertyView.types.boolean.extend({});

PropertyView.names.opacity = PropertyView.types.number.extend({
  session: {
    min: ['number', false, 0],
    max: ['number', false, 100]
  }
});

PropertyView.names.skewX =
PropertyView.names.skewY =
PropertyView.names.rotateX =
PropertyView.names.rotateY =
PropertyView.names.rotateZ = PropertyView.types.number.extend({
  session: {
    min: ['number', false, -360],
    max: ['number', false, 360]
  }
});





var DetailsView = View.extend({
  template:  '<section class="row rows">' +
    '<header class="row">' +
      '<h3>Details for <span data-hook="name"></span></h3>' +
      '<h5 data-hook="object-path"></h5>' +
    '</header>' +

    '<div class="row items"></div>' +
  '</section>',

  initialize: function() {
    this.listenToAndRun(this, 'change:definition', function() {
      this.properties.reset(this.definition);
    });
    /*
    this.listenToAndRun(mappings, 'all', function(evtName) {
      console.info('mappings evt in details view %s%s', evtName, this.objectPath, );
    });
    */
  },

  derived: {
    propNames: {
      deps: ['model'],
      fn: function() {
        var def = this.model.constructor.prototype._definition;
        return Object.keys(def)
          .filter(function(key) {
            return [
              'drawFunction',

              'name',
              'type',
              'zIndex'
            ].indexOf(key) < 0;
          });
      }
    },

    definition: {
      deps: ['propNames'],
      fn: function() {
        var def = this.model.constructor.prototype._definition;
        return this.propNames
          .map(function(name) {
            return assign({name: name}, def[name]);
          });
      }
    },

    objectPath: {
      deps: ['model'],
      fn: function() {
        return mappings.objectPath(this.model);
      }
    }
  },

  collections: {
    properties: Collection.extend({
      mainIndex: 'name',

      model: State.extend({
        idAttribute: 'name',

        session: {
          name: 'string',
          allowNull: 'boolean',
          default: 'any',
          required: 'boolean',
          test: 'any',
          type: 'string',
          values: 'array'
        }
      })
    })
  },

  subviews: {
    propertiesView: {
      selector: '.items',
      prepareView: function (el) {
        return this.renderCollection(this.properties, function (opts) {
          var Constructor = (PropertyView.names[opts.model.name] || PropertyView.types[opts.model.type] || PropertyView);
          // console.info('property name: %s (%s), type: %s (%s)', opts.model.name, !!PropertyView.names[opts.model.name], opts.model.type, !!PropertyView.types[opts.model.type]);
          return new Constructor(opts);
        }, el);
      }
    }
  },

  bindings: {
    'model.name': '[data-hook=name]',
    objectPath: '[data-hook="object-path"]'
  }
});
module.exports = DetailsView;


/***/ },

/***/ 16:
/***/ function(module, exports) {

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
    var str = '';


    var f = function(instance) {

      var collectionName = instance.collection ?
                        isCollectionOfParent(instance, instance.collection.parent) :
                        null;
      if (collectionName) {
        str = collectionName + '.' + str;
        return f(instance.collection.parent);
      }

      var childName = isChildOfParent(instance, instance.parent);
      if (childName) {
        str = childName + '.' + str;
        return f(instance.parent);
      }


      var propName = isPropOfParent(instance, instance.parent);
      if (propName) {
        str = propName + '.' + str;
        return f(instance.parent);
      }

      if (instance.parent) f(instance.parent);
    };

    f(state);

    return str;
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
    props: {
      sourceObject: ['state', true, null],
      sourceProperty: ['string', true, null],

      targetObject: ['state', false, null],
      targetProperty: ['string', false, null],

      transformation: ['any', false, null]
    },

    derived: {
      sourcePath: {
        deps: ['sourceObject', 'sourceProperty'],
        fn: function() {
          return objectPath(this.sourceObject) + this.sourceProperty;
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
          return objectPath(this.targetObject) + this.targetProperty;
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
      var p = objectPath(state) + propName;
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

/***/ },

/***/ 3:
/***/ function(module, exports, __webpack_require__) {

"use strict";

var View = window.VFDeps.View;
var SignalDetailsView = __webpack_require__(34);
var SignalControlView = View.extend({
  template: '<section class="rows signal">' +
    '<header class="row">' +
      '<h3 class="row name"></h3>' +
    '</header>' +

    // '<div class="row gutter-horizontal columns model text-center">' +
    //   '<div class="column input"></div>' +
    //   '<div class="column gutter-horizontal no-grow">&raquo;</div>' +
    //   '<div class="column result"></div>' +
    // '</div>' +

    '<div class="row gutter-horizontal columns test text-center">' +
      '<input class="column input" placeholder="Input" type="text"/>' +
      '<div class="column gutter-horizontal no-grow">&raquo;</div>' +
      '<div class="column result"></div>' +
    '</div>' +
  '</section>',

  session: {
    input: 'any',
    showMappings: ['boolean', true, false]
  },

  derived: {
    result: {
      deps: ['input', 'model', 'model.transformations'],
      fn: function() {
        return this.model.computeSignal(this.input);
      }
    }
  },

  bindings: {
    'model.name': '.name',
    // 'model.input': '.model .input',
    // 'model.result': '.model .result',
    result: '.test .result'
  },

  events: {
    'change .test .input': '_testValue',
    'click header h3': '_showDetails'
  },

  _showDetails: function () {
    this.rootView.showDetails(new SignalDetailsView({
      parent: this,
      model: this.model,
    }));
  },

  _testValue: function(evt) {
    this.input = evt.target.value.trim();
  },

  render: function () {
    this.renderWithTemplate();
    var inputEl = this.query('.test .input');
    if (inputEl && !inputEl.value) {
      inputEl.value = this.input || null;
    }
    return this;
  }
});

SignalControlView.types = {};

module.exports = SignalControlView;

/***/ },

/***/ 34:
/***/ function(module, exports, __webpack_require__) {

"use strict";

var assign = window.VFDeps.assign;
var DetailsView = __webpack_require__(14);
var TransformationControlView = __webpack_require__(37);
var transformationFunctions = __webpack_require__(17);
var SignalDetailsView = DetailsView.extend({
  template: '<section>' +
    '<header>' +
      '<h3>Details for <span data-hook="name"></span></h3>' +
    '</header>' +

    '<div class="row mappings props"></div>' +

    '<div class="row gutter transformations-control columns">' +
      '<input class="column gutter-right" placeholder="New transformation" data-hook="new-transformation-name" type="text"/>' +
      '<div class="column gutter-left no-grow"><button name="add-transformation" class="vfi-plus"></button></div>' +
    '</div>' +
    '<div class="row transformations props"></div>' +
  '</section>',

  subviews: assign({}, DetailsView.prototype.subviews, {
    transformationsView: {
      selector: '.transformations',
      prepareView: function (el) {
        return this.renderCollection(this.model.transformations, TransformationControlView, el);
      }
    }
  }),

  events: {
    'click [name=add-transformation]': '_addTransformation',

    'focus [data-hook=new-transformation-name]': '_focusName'
  },

  _focusName: function() {
    var nameEl = this.queryByHook('new-transformation-name');
    var helper = this.rootView.suggestionHelper;

    nameEl.select();
    helper.attach(nameEl, function(selected){
      nameEl.value = selected;
      helper.detach();
    }).fill(Object.keys(transformationFunctions));
  },

  _addTransformation: function () {
    this.model.transformations.add({
      name: this.queryByHook('new-transformation-name').value.trim()
    });
  },

  bindings: assign({
    'model.name': '[data-hook=name]'
  }, DetailsView.prototype.bindings)
});
module.exports = SignalDetailsView;

/***/ },

/***/ 37:
/***/ function(module, exports, __webpack_require__) {

"use strict";

var View = window.VFDeps.View;
var TransformationControlView = View.extend({
  template: '<div class="transformation gutter columns">' +
      '<div class="column gutter-right text-right" data-hook="name"></div>' +
      '<div class="column gutter-horizontal no-grow"><button name="remove" class="vfi-trash-empty"></button></div>' +
      '<input class="column gutter-left" data-hook="arguments" type="text"/>' +
    '</div>',

  derived: {
    arguments: {
      deps: ['model', 'model.arguments'],
      fn: function() {
        return (this.model.arguments || []).join(',');
      }
    }
  },

  parseArguments: function(value) {
    var state = this.model;
    value = (value || this.queryByHook('arguments').value).trim();
    var math = state.name.indexOf('math.') === 0;
    var values = value.split(',').map(function(arg) {
      arg = math ? Number(arg) : arg;
      arg = math && isNaN(arg) ? 0 : arg;
      return arg;
    });
    this.model.arguments = values;
  },

  bindings: {
    'model.name': '[data-hook=name]',
    'model.arguments': {
      hook: 'arguments',
      type: function(el) {
        if (el === document.activeElement) { return; }
        el.value = this.model.arguments.join(',');
      }
    }
  },

  events: {
    'click [name=remove]': '_remove',

    'keyup [data-hook=arguments]': '_changeArguments'
  },

  _remove: function() {
    this.model.collection.remove(this.model);
  },

  _changeArguments: function() {
    this.parseArguments();
  }
});

module.exports = TransformationControlView;

/***/ },

/***/ 4:
/***/ function(module, exports, __webpack_require__) {

"use strict";

var assign = window.VFDeps.assign;
var SignalControlView = __webpack_require__(3);
var HSLASignalControlView = SignalControlView.types.hslaSignal = SignalControlView.extend({
  template: [
    '<section class="rows signal signal-color">',
    '<header class="row">',
    '<h3 class="name"></h3>',
    '</header>',

    '<div class="row columns gutter-horizontal gutter-bottom">',
    '<div class="column result-color no-grow"></div>',
    '<div class="column result gutter-left"></div>',
    '</div>',

    '<div class="row mappings props"></div>',
    '</section>'
  ].join(''),

  bindings: assign({}, SignalControlView.prototype.bindings, {
    'model.result': [
      {
        selector: '.result-color',
        type: function(el, val) {
          el.style.backgroundColor = val;
        }
      },
      {
        selector: '.result',
        type: 'text'
      }
    ]
  })
});
module.exports = HSLASignalControlView;

/***/ },

/***/ 7:
/***/ function(module, exports, __webpack_require__) {

"use strict";

var assign = window.VFDeps.assign;
var SignalControlView = __webpack_require__(3);
var BeatSignalControlView = SignalControlView.types.beatSignal = SignalControlView.extend({
  template: '<section class="rows signal signal-beat">' +
    '<header class="row">' +
      '<h3 class="name"></h3>' +
    '</header>' +

    '<div class="row columns gutter-horizontal gutter-bottom">' +
      '<div class="column result-dot no-grow gutter-right"></div>' +
      '<div class="column result gutter-left">' +
        '<input class="column input" placeholder="BPM" data-hook="input" />' +
      '</div>' +
    '</div>' +

    '<div class="row mappings props"></div>' +
  '</section>',

  bindings: assign({}, SignalControlView.prototype.bindings, {
    'model.result': [
      {
        selector: '.result-dot',
        type: function(el, val) {
          el.style.backgroundColor = 'hsla(190, 81%, 67%,' + (val / 100) + ')';
        }
      }
    ]
  }),

  events: assign({}, SignalControlView.prototype.events, {
    'change [data-hook=input]': '_updateBPM'
  }),

  _updateBPM: function() {
    this.model.input = parseInt(this.queryByHook('input').value.trim(), 10);
  },

  render: function () {
    this.renderWithTemplate();
    var inputEl = this.queryByHook('input');
    if (inputEl && !inputEl.value) {
      inputEl.value = this.model.input;
    }
    return this;
  }
});
module.exports = BeatSignalControlView;

/***/ },

/***/ 8:
/***/ function(module, exports, __webpack_require__) {

"use strict";

var SignalControlView = __webpack_require__(3);
var HSLASignalControlView = __webpack_require__(4);

var RGBASignalControlView = SignalControlView.types.rgbaSignal = HSLASignalControlView.extend({});

module.exports = RGBASignalControlView;

/***/ }

});
//# sourceMappingURL=2-build.js.map