'use strict';
var mappings = require('./../mapping/state');
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

              'uiState',
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
    'model.uiState': {selector: 'header', type: 'class'},
    'model.name': '[data-hook=name]',
    objectPath: '[data-hook="object-path"]'
  }
});
module.exports = DetailsView;
