'use strict';
var View = window.VFDeps.View;
var assign = window.VFDeps.assign;
var MappingControlView = View.extend({
  initialize: function () {
    var mappingView = this;
    var target = this.model.targetProperty;
    var layer = this.model.targetModel;

    this.listenToAndRun(layer, 'change:' + target, function () {
      mappingView.propValue = layer[target];
    });
  },

  derived: {
    rootView: {
      deps: ['parent'],
      fn: function () {
        for (var inst = this; inst; inst = inst.parent) {
          if (!inst.parent) { return inst; }
        }
      }
    },
    signalNames: {
      deps: ['rootView'],
      fn: function () {
        return this.rootView ? this.rootView.signalNames || [] : [];
      }
    }
  },

  events: {
    'click [name=default-value]': '_defaultValue',


    'click [name=clear-mapping]': '_clearMapping',


    'focus [data-hook=value][contenteditable=true]': '_valueFocus',
    'blur [data-hook=value][contenteditable=true]': '_valueBlur',

    'wheel [data-hook=value][contenteditable=true]': '_valueWheel',

    'paste [data-hook=value][contenteditable=true]': '_valueChange',
    'input [data-hook=value][contenteditable=true]': '_valueChange',


    'focus [data-hook=mapping][contenteditable=true]': '_mappingFocus',
    'blur [data-hook=mapping][contenteditable=true]': '_mappingBlur',

    'paste [data-hook=mapping][contenteditable=true]': '_mappingChange',
    'input [data-hook=mapping][contenteditable=true]': '_mappingChange'
  },


  _defaultValue: function(evt) {
    evt.preventDefault();
    var def = this.model.definition.default;
    var result = typeof def === 'function' ? def() : def;
    this.model.targetModel.set(this.model.targetProperty, result);
  },



  _clearMapping: function(evt) {
    evt.preventDefault();
    this.model.unset('eventNames');
    this.model.targetModel.trigger('change:mappings', this.model.targetModel.mappings);
  },



  _mappingFocus: function() {
    var helper = this.rootView.suggestionHelper;
    if (!helper) { return; }
    var inputEl = this.queryByHook('mapping');
    var model = this.model;
    var layer = model.targetModel;
    helper.attach(inputEl, function (selected) {
      console.info('selected', selected);
      model.eventNames = selected;
      layer.trigger('change:mappings', layer.mappings);
      helper.detach();
    }).fill(this.signalNames);
  },

  _mappingBlur: function(evt) {
    this.rootView.suggestionHelper.detach();
    this._mappingChange(evt);
  },

  _mappingChange: function () {
    var model = this.model;
    var layer = model.targetModel;
    var newEventNames = this.queryByHook('mapping').textContent.trim();
    if ((model.eventNames || '') === newEventNames) { return; }
    model.eventNames = newEventNames;
    layer.trigger('change:mappings', layer.mappings);
  },










  _valueFocus: function() {
    var def = this.model.definition;
    if (!def) {
      console.warn('no model definition', this.model);
      return;
    }
    if (def.values && def.values.length > 1) {
      var helper = this.rootView.suggestionHelper;
      if (!helper) { return; }
      var inputEl = this.queryByHook('value');
      helper.attach(inputEl, function() {}).fill(def.values);
    }
  },

  _valueBlur: function(evt) {
    this.rootView.suggestionHelper.detach();
    this._valueChange(evt);
  },






  _valueWheel: function (evt) {
    if (evt.target !== document.activeElement) { return; }

    var def = this.model.definition;
    var valueEl = this.queryByHook('value');
    var value = valueEl.textContent.trim();

    var added = Math.round(evt.wheelDeltaY * (1 / 120));

    if (def.values && def.values.length > 1) {
      evt.preventDefault();
      var currentIndex = def.values.indexOf(value);
      if (currentIndex < 0) { currentIndex = 0; }
      if (added > 0 && currentIndex === def.values.length - 1) { currentIndex = 0; }
      else if (added < 0 && currentIndex === 0) { currentIndex = def.values.length - 1; }
      else { currentIndex += added; }
      value = def.values[currentIndex];
    }
    else if (def.type === 'number') {
      evt.preventDefault();
      value = (Number(value) + added);
      if (def.min) { value = Math.min(def.min, value); }
      if (def.max) { value = Math.max(def.max, value); }
    }
    valueEl.textContent = value;
    this._valueChange();
  },





  _valueChange: function () {
    var model = this.model;
    var layer = model.targetModel;
    var def = model.definition;
    if (!def) { return; }

    var value = this.queryByHook('value').textContent.trim();
    switch (def.type) {
    case 'number':
      value = value === '' ? def.default : Number(value);
      break;
    case 'boolean':
      value = value === 'false' || !value ? false : true;
      break;
    default:
      value = value === '' ? def.default : value;
    }

    if (def.values && def.values.indexOf(value) < 0) {
      return;
    }

    if (layer[model.targetProperty] !== value) {
      layer[model.targetProperty] = value;
    }
  },

  session: {
    popupEl: 'element',
    popupHolderEl: ['element', false, function () { return document.body; }],
    propValue: 'any',
    propEvent: ['string', true, '']
  },

  bindings: {
    'model.targetProperty': [
      { selector: '.prop-name' },
      { type: 'class' }
    ],
    'model.eventNames': [
      {
        selector: '[data-hook=value]',
        type: function(el, val) {
          el.setAttribute('contenteditable', !val);
        }
      },
      {
        selector: '[data-hook=mapping]'
      }
    ],
    propValue: '[data-hook=value]'
  },

  template: [
    '<div class="prop columns">',
    '<strong class="prop-name column gutter-right"></strong>',
    '<span class="column columns">',
    '<span class="column no-grow gutter-horizontal"><button name="default-value" class="vfi-trash-empty"></button></span>',
    '<span class="column gutter-left" data-placeholder="Value" data-hook="value"></span>',
    '</span>',
    '<span class="column columns mapping">',
    '<span class="column gutter-right" data-placeholder="Events" contenteditable="true" data-hook="mapping"></span>',
    '<span class="column gutter-left no-grow"><button name="clear-mapping" class="vfi-trash-empty"></button></span>',
    '</span>',
    '</div>'
  ].join('')
});


MappingControlView.opacity = MappingControlView.extend({
  template: [
    '<div class="prop columns">',
    '<strong class="prop-name column gutter-right"></strong>',
    '<span class="column columns">',
    '<span class="column no-grow gutter-horizontal"><button name="default-value" class="vfi-trash-empty"></button></span>',
    '<span class="column gutter-left percents" data-hook="value"></span>',
    '</span>',
    '<span class="column columns mapping">',
    '<span class="column gutter-right" contenteditable="true" data-hook="mapping"></span>',
    '<span class="column gutter-left no-grow"><button name="clear-mapping" class="vfi-trash-empty"></button></span>',
    '</span>',
    '</div>'
  ].join(''),

  bindings: assign({}, MappingControlView.prototype.bindings, {
    propValue: {
      hook: 'value',
      type: function (el, val) {
        el.textContent = Math.round(val || 0);
      }
    }
  })
});

MappingControlView.blending = MappingControlView.extend({
  template: [
    '<div class="prop columns">',
    '<strong class="prop-name column gutter-right"></strong>',
    '<span class="column columns">',
    '<span class="column no-grow gutter-horizontal"><button name="default-value" class="vfi-trash-empty"></button></span>',
    '<span class="column gutter-left" data-hook="value"></span>',
    '</span>',
    '<span class="column columns mapping">',
    '<span class="column gutter-right" contenteditable="true" data-hook="mapping"></span>',
    '<span class="column gutter-left no-grow"><button name="clear-mapping" class="vfi-trash-empty"></button></span>',
    '</span>',
    '</div>'
  ].join('')
});
module.exports = MappingControlView;