'use strict';
var assign = require('lodash.assign');
var DetailsView = require('./../controller/details-view');
var View = require('./../controller/control-view');
var objectPath = require('./../object-path');

var StylePropertyView = View.extend({
  template: `
    <div class="columns object-prop prop-type-default">
      <div class="column gutter text-right prop-name"></div>
      <div class="column no-grow prop-value-reset">
        <button class="vfi-cancel"></button>
      </div>
      <div class="column prop-value">
        <input name="value" type="text" />
      </div>
      <div class="column prop-mapping-clear no-grow">
        <button class="vfi-unlink"></button>
      </div>
      <div class="column prop-mapping-name">
        <input name="mapping-name" type="text" />
      </div>
      <div class="column no-grow">
        <button class="mapping-details"></button>
      </div>
    </div>
  `,

  initialize: function() {
    View.prototype.initialize.apply(this, arguments);
    this.listenToAndRun(this.rootView.mappings, 'change:targets', function() {
      this.trigger('change:rootView.mappings');
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

    propertyPath: {
      deps: ['model.name', 'parent.modelPath'],
      fn: function() {
        return this.parent.modelPath + '.styleProperties.' + this.model.name + '.value';
      }
    },

    mapping: {
      deps: ['propertyPath', 'rootView.mappings'],
      fn: function() {
        return this.rootView.mappings.findMappingByTarget(this.propertyPath);
      }
    }
  },

  bindings: {
    'model.name': '.prop-name',
    'model.value': {
      selector: '[name="value"]',
      type: 'value'
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
    // 'click .prop-value-reset button': 'resetProp _handleReset',
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
    return {
      path: objectPath(this.model),
      property: 'value',
      value: this.query('[name="value"]').value
    };
  },

  events: {
    'focus [name="mapping-name"]': '_suggestMapping',
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

  _showMapping: function() {
    var mapping = this.mapping;
    this.rootView.regionRight.focusTab('Mappings');
    this.rootView.mappingsView.mappingsList.views.forEach(function(view) {
      if (view.model === mapping) {
        view.el.scrollIntoView();
        view.blink();
      }
    });
  }
});



var LayerDetailsView = DetailsView.extend({
  template: `
    <section>
      <header>
        <div class="columns">
          <h3 class="column">Details for <span data-hook="name"></span> <small data-hook="type"></small></h3>
          <div class="column no-grow"><button class="vfi-eye" name="show-origin"></button></div>
        </div>
        <h5 data-hook="object-path"></h5>
      </header>

      <div class="row columns">
        <div class="columns"><input type="text" name="style-prop-name" placeholder="--css-var-name" /></div>
        <div class="columns"><input type="text" name="style-prop-default" placeholder="2px, 100%, " /></div>
        <div class="columns no-grow"><button name="style-prop-add" class="vfi-plus"></button></div>
      </div>

      <div class="row style-props" ></div>
      <hr/>
      <div class="row mappings props"></div>
    </section>
  `,


  events: assign(DetailsView.prototype.events, {
    'click [name=show-origin]': '_showOrigin',
    'click [name=style-prop-add]': 'addStyleProperty'
  }),

  _showOrigin: function() {
    this.rootView.trigger('blink', this.modelPath);
  },

  addStyleProperty: function() {
    var val = this.query('[name=style-prop-default]').value;
    var props = this.model.styleProperties.serialize();
    props.push({
      name: this.query('[name=style-prop-name]').value,
      default: val,
      value: val
    });
    this.rootView.sendCommand('propChange', {
      path: 'layers.' + this.model.getId(),
      property: 'styleProperties',
      value: props
    });
  },

  render: function() {
    DetailsView.prototype.render.apply(this, arguments);

    if (this.styleProperties) {
      this.styleProperties.remove();
    }

    if (this.model.styleProperties) {
      this.styleProperties = this.renderCollection(this.model.styleProperties, StylePropertyView, '.style-props');
    }

    return this;
  }
});

LayerDetailsView.types = {};

module.exports = LayerDetailsView;