'use strict';
var mappings = require('./../mapping/service');
var assign = require('lodash.assign');
var Collection = require('ampersand-collection');
var State = require('ampersand-state');
var View = require('./control-view');
var objectPath = require('./../object-path');

var PropertyView = View.extend({
  template: `
    <div class="columns object-prop prop-type-default">
      <div class="column gutter text-right prop-name"></div>
      <div class="column no-grow prop-value-reset">
        <button class="vfi-cancel"></button>
      </div>
      <div class="column prop-value">
        <input name="value" type="text" />
      </div>
      <div class="column prop-mapping-clear">
        <button class="vfi-unlink"></button>
      </div>
    </div>
  `,

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);

    this.listenToAndRun(this.parent.model, 'change:' + this.model.name, function() {
      this.trigger('change:model', this.model);
    });
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

    mappingObject: {
      deps: ['value'],
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

    mappingObject: {
      type: 'booleanAttribute',
      selector: '.prop-mapping-clear button',
      name: 'disabled',
      invert: true
    }
  },

  commands: {
    'click .prop-value-reset button': 'resetProp _handleReset',
  },
  events: {
    'change [name="value"]': '_handleChange',
    'focus [type="text"][name="value"]': '_suggestValues'
  },

  _handleReset: function() {
    this.parent.model.unset(this.model.name);
  },

  _handleChange: function(evt) {
    var parent = this.model.collection.parent.model;
    this.sendCommand('propChange', {
      path: objectPath(parent),
      property: this.model.name,
      value: evt.target.value
    });
  },

  _suggestValues: function(evt) {
    var view = this;
    var helper = view.suggestionHelper;
    if (!helper || !view.model.values || !view.model.values.length) return;

    var model = view.model;
    var parent = model.collection.parent.model;
    var el = evt.target;
    helper.attach(el, function(selected) {
      console.info('set %s . %s = %s', objectPath(parent), model.name, selected, el.value !== selected);

      view.sendCommand('propChange', {
        path: objectPath(parent),
        property: model.name,
        value: selected
      });

      helper.detach();
    }).fill(model.values);
  }
});



PropertyView.types = {};

PropertyView.types.boolean = PropertyView.extend({
  template: `
    <div class="columns object-prop prop-type-boolean">
      <div class="column gutter text-right prop-name"></div>
      <div class="column no-grow">
        <button class="vfi-cancel"></button>
      </div>
      <div class="column prop-value">
        <button class="prop-toggle-btn"></button>
      </div>
      <div class="column prop-mapping-clear">
        <button class="vfi-unlink"></button>
      </div>
    </div>
  `,

  bindings: assign({}, PropertyView.prototype.bindings, {
    value: {
      selector: 'button.prop-toggle-btn',
      type: 'booleanClass',
      yes: 'vfi-toggle-on',
      no: 'vfi-toggle-off'
    }
  }),

  events: {
    'click button.prop-toggle-btn': '_handleChange'
  },

  _handleChange: function() {
    var parent = this.model.collection.parent.model;
    this.sendCommand('propChange', {
      path: objectPath(parent),
      property: this.model.name,
      value: !parent[this.model.name]
    });
  }
});

PropertyView.types.number = PropertyView.extend({
  template: `
    <div class="columns object-prop prop-type-number">
      <div class="column gutter text-right prop-name"></div>
      <div class="column no-grow">
        <button class="vfi-cancel"></button>
      </div>
      <div class="column prop-value">
        <input name="value" type="number" />
      </div>
      <div class="column prop-mapping-clear">
        <button class="vfi-unlink"></button>
      </div>
    </div>
  `,

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
    var parent = this.model.collection.parent.model;
    this.sendCommand('propChange', {
      path: objectPath(parent),
      property: this.model.name,
      value: Number(evt.target.value)
    });
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
  template: `
    <section class="row rows">
      <header class="row no-grow">
        <h3>Details for <span data-hook="name"></span></h3>
        <h5 data-hook="object-path"></h5>
      </header>

      <div class="row items"></div>
    </section>
  `,

  initialize: function() {
    this.listenToAndRun(this, 'change:definition', function() {
      this.properties.reset(this.definition);
    });
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

    modelPath: {
      // no cache?
      deps: ['model'],
      fn: function() {
        return objectPath(this.model);
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
      waitFor: 'el',
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
    modelPath: '[data-hook="object-path"]'
  }
});
module.exports = DetailsView;
