'use strict';
var assign = require('lodash.assign');
var View = require('./control-view');
var objectPath = require('./../object-path');

var PropertyView = View.extend({
  template: `
    <div class="columns object-prop prop-type-default">
      <div class="column gutter text-right prop-name"></div>
      <div class="column no-grow prop-value-reset">
        <button title="Reset to default value" class="vfi-cancel"></button>
      </div>
      <div class="column prop-value">
        <input name="value" type="text" />
      </div>
      <div class="column prop-mapping-clear no-grow">
        <button title="Remove mapping" class="vfi-unlink"></button>
      </div>
      <div class="column prop-mapping-name">
        <input placeholder="mappingName" name="mapping-name" type="text" />
      </div>
      <div class="column no-grow">
        <button title="Mapping details" class="mapping-details"></button>
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

    propertyPath: {
      deps: [],
      fn: function() {
        return this.parent.modelPath + '.' + this.model.name;
      }
    },

    mapping: {
      deps: [],
      fn: function() {
        return this.rootView.mappings.findMappingByTarget(this.propertyPath);
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

    'mapping.name': [
      {
        type: 'booleanAttribute',
        selector: '.prop-mapping-clear button',
        name: 'disabled',
        invert: true
      },
      {
        type: 'value',
        selector: '[name="mapping-name"]'
      },
      {
        type: 'booleanClass',
        selector: '.mapping-details',
        yes: 'vfi-eye',
        no: 'vfi-eye-off'
      },
      {
        type: 'booleanAttribute',
        selector: '.mapping-details',
        name: 'disabled',
        invert: true
      },
      {
        type: 'booleanAttribute',
        selector: '.prop-value-reset button',
        name: 'disabled'
      }
    ]
  },

  commands: {
    'click .prop-mapping-clear button': 'updateMapping _handleRemoveMappingTarget',
    'change [name="value"]': 'propChange _handleChange',
    'click .prop-value-reset button': 'propChange _handleReset',
  },

  _handleRemoveMappingTarget: function() {
    var propertyPath = this.propertyPath;
    var mapping = this.mapping.serialize();
    mapping.targets = mapping.targets.filter(function(target) {
      return target !== propertyPath;
    });
    return {mapping: mapping};
  },

  _handleChange: function() {
    var parent = this.model.collection.parent.model;
    return {
      path: parent.modelPath || objectPath(parent),
      property: this.model.name,
      value: this.query('[name="value"]').value
    };
  },

  _handleReset: function() {
    var parent = this.model.collection.parent.model;
    return {
      path: parent.modelPath || objectPath(parent),
      property: this.model.name,
      value: this.model.default
    };
  },

  events: {
    'focus [name="mapping-name"]': '_suggestMapping',
    'focus [type="text"][name="value"]': '_suggestValues',
    'click button.mapping-details': '_showMapping'
  },

  _suggestMapping: function(evt) {
    var view = this;
    var helper = view.suggestionHelper;
    var mappings = this.rootView.mappings;
    var propertyPath = this.propertyPath;

    helper.attach(evt.target, function(selected) {
      var mappingState = mappings.get(selected);
      if (!mappingState) return;
      var mapping = mappingState.serialize();
      mapping.targets.push(propertyPath);
      view.sendCommand('updateMapping', {
        mapping: mapping
      });
      helper.detach();
    }).fill(mappings.map(function(state) { return state.name; }));
  },

  _suggestValues: function(evt) {
    var view = this;
    var helper = view.suggestionHelper;
    if (!helper || !view.model.values || !view.model.values.length) return;

    var model = view.model;
    var parent = model.collection.parent.model;
    var el = evt.target;
    helper.attach(el, function(selected) {
      // console.info('set %s . %s = %s', objectPath(parent), model.name, selected, el.value !== selected);

      view.sendCommand('propChange', {
        path: objectPath(parent),
        property: model.name,
        value: selected
      });

      el.value = selected;
      helper.detach();
    }).fill(model.values);
  },

  _showMapping: function() {
    var mapping = this.mapping;
    var rootView = this.rootView;
    rootView.regionRight.focusTab('Mappings');
    rootView.mappingsView.mappingsList.views.forEach(function(view) {
      if (view.model === mapping) {
        view.el.scrollIntoView();
        view.blink();
      }
    });
  }
});





/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/



PropertyView.types = {};




/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/


PropertyView.types.boolean = PropertyView.extend({
  template: `
    <div class="columns object-prop prop-type-boolean">
      <div class="column gutter text-right prop-name"></div>
      <div class="column no-grow prop-value-reset">
        <button title="Reset to default value" class="vfi-cancel"></button>
      </div>
      <div class="column prop-value">
        <button class="prop-toggle-btn"></button>
      </div>
      <div class="column prop-mapping-clear no-grow">
        <button title="Remove mapping" class="vfi-unlink"></button>
      </div>
      <div class="column prop-mapping-name">
        <input placeholder="mappingName" name="mapping-name" type="text" />
      </div>
      <div class="column no-grow">
        <button title="Mapping details" class="mapping-details"></button>
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

  events: assign({}, PropertyView.prototype.events, {
    'focus [name="mapping-name"]': '_suggestMapping',
    'click button.prop-toggle-btn': '_handleChange'
  }),

  _handleChange: function() {
    var parent = this.model.collection.parent.model;
    this.sendCommand('propChange', {
      path: objectPath(parent),
      property: this.model.name,
      value: !parent[this.model.name]
    });
  }
});




/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/


PropertyView.types.number = PropertyView.extend({
  template: `
    <div class="columns object-prop prop-type-number">
      <div class="column gutter text-right prop-name"></div>
      <div class="column no-grow prop-value-reset">
        <button title="Reset to default value" class="vfi-cancel"></button>
      </div>
      <div class="column prop-value">
        <input name="value" type="number" />
      </div>
      <div class="column prop-mapping-clear no-grow">
        <button title="Remove mapping" class="vfi-unlink"></button>
      </div>
      <div class="column prop-mapping-name">
        <input placeholder="mappingName" name="mapping-name" type="text" />
      </div>
      <div class="column no-grow">
        <button title="Mapping details" class="mapping-details"></button>
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

  _handleChange: function() {
    var payload = PropertyView.prototype._handleChange.apply(this, arguments);
    payload.value = Number(payload.value);
    return payload;
  }
});

















/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/





PropertyView.names = {};




/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/


PropertyView.names.active = PropertyView.types.boolean.extend({});




/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/


PropertyView.names.opacity = PropertyView.types.number.extend({
  session: {
    min: ['number', false, 0],
    max: ['number', false, 100]
  }
});


module.exports = PropertyView;