'use strict';
var assign = require('lodash.assign');
var View = require('./../controller/control-view');

var ParamView = View.extend({
  template: `
    <div class="columns object-prop parameter-type-default">
      <div class="column gutter text-right parameter-name"></div>
      <div class="column no-grow gutter parameter-type"></div>
      <div class="column no-grow parameter-value-reset">
        <button title="Reset to default value" class="vfi-cancel"></button>
      </div>
      <div class="column parameter-value">
        <input name="value" type="text" />
      </div>
      <div class="column parameter-mapping-clear no-grow">
        <button title="Remove mapping" class="vfi-unlink"></button>
      </div>
      <div class="column parameter-mapping-name">
        <input placeholder="mappingName" name="mapping-name" type="text" />
      </div>
      <div class="column no-grow">
        <button title="Mapping details" class="mapping-details"></button>
      </div>
    </div>
  `,

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.listenTo(this.rootView, 'app:worker:addMapping app:worker:updateMapping app:worker:removeMapping', function() {
      this.trigger('change:mappings');
    });
  },

  derived: {
    suggestionHelper: {
      cache: false,
      deps: [],
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
        'model.value'
      ],
      fn: function() {
        return this.model.value;
      }
    },

    parameterPath: {
      deps: [
        'model.modelPath'
      ],
      fn: function() {
        return this.model.modelPath + '.value';
      }
    },

    mapping: {
      deps: [
        'mappings',
        'parameterPath'
      ],
      fn: function() {
        return this.rootView.mappings.findMappingByTarget(this.parameterPath);
      }
    }
  },

  bindings: {
    isProperty: {
      type: 'booleanClass',
      name: 'instance-property'
    },

    parameterPath: {
      type: 'attribute',
      name: 'title',
      selector: '.parameter-name'
    },

    'model.name': {
      type: 'text',
      selector: '.parameter-name'
    },

    'model.type': {
      type: function(el, val) {
        el.textContent = (val || 'any')[0].toUpperCase();
        el.title = val;
      },
      selector: '.parameter-type'
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
        selector: '.parameter-mapping-clear button',
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
        selector: '.parameter-value-reset button',
        name: 'disabled'
      }
    ]
  },

  commands: {
    'click .parameter-mapping-clear button': 'updateMapping _handleRemoveMappingTarget',
    'change [name="value"]': 'propChange _handleChange',
    'click .parameter-value-reset button': 'propChange _handleReset'
  },

  _handleRemoveMappingTarget: function() {
    var parameterPath = this.parameterPath;
    var mapping = this.mapping.serialize();
    mapping.targets = mapping.targets.filter(function(target) {
      return target !== parameterPath;
    });
    return {mapping: mapping};
  },

  _handleChange: function() {
    return {
      path: this.model.modelPath,
      property: 'value',
      value: this.query('[name="value"]').value
    };
  },

  _handleReset: function() {
    return {
      path: this.model.modelPath,
      property: 'value',
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
    var parameterPath = this.parameterPath;

    helper.attach(evt.target, function(selected) {
      var mappingState = mappings.get(selected);
      if (!mappingState) return;
      var mapping = mappingState.serialize();
      mapping.targets.push(parameterPath);
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
    var el = evt.target;
    helper.attach(el, function(selected) {
      // console.info('set %s . %s = %s', objectPath(parent), model.name, selected, el.value !== selected);

      view.sendCommand('propChange', {
        path: model.modelPath,
        property: 'value',
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



ParamView.types = {};




/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/


ParamView.types.boolean = ParamView.extend({
  template: `
    <div class="columns object-prop parameter-type-boolean">
      <div class="column gutter text-right parameter-name"></div>
      <div class="column no-grow gutter parameter-type"></div>
      <div class="column no-grow parameter-value-reset">
        <button title="Reset to default value" class="vfi-cancel"></button>
      </div>
      <div class="column parameter-value">
        <button class="parameter-toggle-btn"></button>
      </div>
      <div class="column parameter-mapping-clear no-grow">
        <button title="Remove mapping" class="vfi-unlink"></button>
      </div>
      <div class="column parameter-mapping-name">
        <input placeholder="mappingName" name="mapping-name" type="text" />
      </div>
      <div class="column no-grow">
        <button title="Mapping details" class="mapping-details"></button>
      </div>
    </div>
  `,

  bindings: assign({}, ParamView.prototype.bindings, {
    value: {
      selector: 'button.parameter-toggle-btn',
      type: 'booleanClass',
      yes: 'vfi-toggle-on',
      no: 'vfi-toggle-off'
    }
  }),

  commands: {
    'click .parameter-mapping-clear button': 'updateMapping _handleRemoveMappingTarget',
    'click button.parameter-toggle-btn': 'propChange _handleChange',
    'click .parameter-value-reset button': 'propChange _handleReset'
  },

  events: assign({}, ParamView.prototype.events, {
    'focus [name="mapping-name"]': '_suggestMapping'
  }),

  _handleChange: function() {
    return {
      path: this.model.modelPath,
      property: 'value',
      value: !this.model.value
    };
  }
});




/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/


ParamView.types.number = ParamView.extend({
  template: `
    <div class="columns object-prop parameter-type-number">
      <div class="column gutter text-right parameter-name"></div>
      <div class="column no-grow gutter parameter-type"></div>
      <div class="column no-grow parameter-value-reset">
        <button title="Reset to default value" class="vfi-cancel"></button>
      </div>
      <div class="column parameter-value">
        <input name="value" type="number" />
      </div>
      <div class="column parameter-mapping-clear no-grow">
        <button title="Remove mapping" class="vfi-unlink"></button>
      </div>
      <div class="column parameter-mapping-name">
        <input placeholder="mappingName" name="mapping-name" type="text" />
      </div>
      <div class="column no-grow">
        <button title="Mapping details" class="mapping-details"></button>
      </div>
    </div>
  `,

  bindings: assign({}, ParamView.prototype.bindings, {
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
    var payload = ParamView.prototype._handleChange.apply(this, arguments);
    payload.value = Number(payload.value);
    return payload;
  }
});

















/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/





ParamView.names = {};




/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/


ParamView.names.active = ParamView.types.boolean.extend({});




/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/


ParamView.names.opacity = ParamView.types.number.extend({
  session: {
    min: ['number', false, 0],
    max: ['number', false, 1]
  }
});


module.exports = ParamView;