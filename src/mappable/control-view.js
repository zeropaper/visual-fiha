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
      deps: ['rootView', 'rootView.signalNames'],
      fn: function () {
        return this.rootView ? this.rootView.signalNames || [] : [];
      }
    }
  },

  events: {
    'click [name=to-multi-mapping]': '_addToMulti',
    'click [name=default-value]': '_defaultValue',


    'click [name=clear-mapping]': '_clearMapping',

    'focus [data-hook=value]': '_valueFocus',

    'wheel [data-hook=value]': '_valueWheel',

    'paste [data-hook=value]': '_valueChange',
    'change [data-hook=value]': '_valueChange',


    'focus [data-hook=mapping]': '_mappingFocus',
    'blur [data-hook=mapping]': '_mappingBlur',

    'paste [data-hook=mapping]': '_mappingChange',
    'change [data-hook=mapping]': '_mappingChange'
  },

  _addToMulti: function() {
    this.rootView.addMultiMapping(this.model);
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
    if (!evt.shiftKey) {
      this._defaultValue(evt);
    }
  },



  _mappingFocus: function() {
    var helper = this.rootView.suggestionHelper;
    if (!helper) { return; }
    var mappingEl = this.queryByHook('mapping');
    var model = this.model;
    var layer = model.targetModel;
    helper.attach(mappingEl, function (selected) {
      model.eventNames = selected;
      layer.trigger('change:mappings', layer.mappings);
      helper.detach();
    }).fill(this.signalNames);
  },

  _mappingBlur: function() {
    this._mappingChange();
    // this.rootView.suggestionHelper.detach();
  },

  _mappingChange: function () {
    var model = this.model;
    var layer = model.targetModel;
    var mappingEl = this.queryByHook('mapping');
    var newEventNames = mappingEl.value.trim();
    if ((model.eventNames || '') === newEventNames) { return; }
    model.eventNames = newEventNames;
    layer.trigger('change:mappings', layer.mappings);
  },










  _valueFocus: function() {
    var model = this.model;
    var layer = model.targetModel;
    var def = this.model.definition;
    if (!def) {
      console.warn('no model definition', this.model);
      return;
    }

    var valueEl = this.queryByHook('value');
    if (valueEl.select) valueEl.select();

    if (def.values && def.values.length > 1) {
      var helper = this.rootView.suggestionHelper;
      if (!helper) { return; }

      helper.attach(valueEl, function(selected) {
        valueEl.value = selected;
        layer[model.targetProperty] = selected;
        helper.detach();
      }).fill(def.values);
    }
  },





  _valueWheel: function (evt) {
    if (evt.target !== document.activeElement) { return; }

    var def = this.model.definition;
    var valueEl = this.queryByHook('value');
    var value = valueEl.value.trim();

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
    valueEl.value = value;
    this._valueChange();
  },





  _valueChange: function () {
    var model = this.model;
    var layer = model.targetModel;
    var def = model.definition;
    if (!def) { return; }

    var value = this.queryByHook('value').value.trim();
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
          el.disabled = !!val;
        }
      },
      {
        selector: '[data-hook=mapping]',
        type: 'value'
      }
    ],
    propValue: {
      hook: 'value',
      type: 'value'
    }
  },

  template: '<div class="prop columns">' +
    '<span class="column no-grow gutter-right"><button name="to-multi-mapping" class="vfi-attach"></button></span>' +
    '<strong class="prop-name column gutter-horizontal"></strong>' +
    '<span class="column columns">' +
      '<span class="column no-grow gutter-horizontal"><button name="default-value" class="vfi-trash-empty"></button></span>' +
      '<input type="text" class="column gutter-left" placeholder="Value" data-hook="value" />' +
    '</span>' +
    '<span class="column columns mapping">' +
      '<input type="text" class="column gutter-right" placeholder="Events" data-hook="mapping" />' +
      '<span class="column gutter-left no-grow"><button name="clear-mapping" class="vfi-trash-empty"></button></span>' +
    '</span>' +
  '</div>'
});


MappingControlView.boolean = MappingControlView.extend({
  template: '<div class="prop columns">' +
    '<span class="column no-grow gutter-right"><button name="to-multi-mapping" class="vfi-attach"></button></span>' +
    '<strong class="prop-name column gutter-horizontal"></strong>' +
    '<span class="column columns">' +
      '<span class="column no-grow gutter-horizontal"><button name="default-value" class="vfi-trash-empty"></button></span>' +
      '<span class="column gutter-left"><button data-hook="value"></button></span>' +
    '</span>' +
    '<span class="column columns mapping">' +
      '<input class="column gutter-right" placeholder="Events" data-hook="mapping" />' +
      '<span class="column gutter-left no-grow"><button name="clear-mapping" class="vfi-trash-empty"></button></span>' +
    '</span>' +
  '</div>',

  bindings: {
    propValue: {
      hook: 'value',
      type: 'booleanClass',
      yes: 'vfi-toggle-on',
      no: 'vfi-toggle-off'
    },
    'model.targetProperty': [
      { selector: '.prop-name' },
      { type: 'class' }
    ],
    'model.eventNames': [
      {
        selector: '[data-hook=value]',
        type: function(el, eventNames) {
          el.disabled = !!eventNames;
        }
      },
      {
        selector: '[data-hook=mapping]',
        type: 'value'
      }
    ]
  },

  events: assign({}, MappingControlView.prototype.events, {
    'click [data-hook=value]': '_toggle'
  }),

  _toggle: function() {
    this.model.targetModel.toggle(this.model.targetProperty);
  }
});


MappingControlView.number = MappingControlView.extend({
  _valueChange: function () {
    var model = this.model;
    var layer = model.targetModel;

    var value = parseInt(this.queryByHook('value').value.trim() || 0, 10);

    if (layer[model.targetProperty] !== value) {
      layer[model.targetProperty] = value;
    }
  },

  template: '<div class="prop columns">' +
    '<span class="column no-grow gutter-right"><button name="to-multi-mapping" class="vfi-attach"></button></span>' +
    '<strong class="prop-name column gutter-horizontal"></strong>' +
    '<span class="column columns">' +
      '<span class="column no-grow gutter-horizontal"><button name="default-value" class="vfi-trash-empty"></button></span>' +
      '<input type="number" class="column gutter-left" placeholder="Value" data-hook="value" />' +
    '</span>' +
    '<span class="column columns mapping">' +
      '<input type="text" class="column gutter-right" placeholder="Events" data-hook="mapping" />' +
      '<span class="column gutter-left no-grow"><button name="clear-mapping" class="vfi-trash-empty"></button></span>' +
    '</span>' +
  '</div>'
});

MappingControlView.range = MappingControlView.number.extend({
  min: 0,
  max: 100,

  _valueChange: function () {
    var model = this.model;
    var min = this.min;
    var max = this.max;

    var layer = model.targetModel;

    var value = parseInt(this.queryByHook('value').value.trim() || 0, 10);
    value = value < min ? min : (value > max ? max : value);

    if (layer[model.targetProperty] !== value) {
      layer[model.targetProperty] = value;
    }
  },

  template: function() {
    return '<div class="prop columns">' +
      '<span class="column no-grow gutter-right"><button name="to-multi-mapping" class="vfi-attach"></button></span>' +
      '<strong class="prop-name column gutter-horizontal"></strong>' +
      '<span class="column columns">' +
        '<span class="column no-grow gutter-horizontal"><button name="default-value" class="vfi-trash-empty"></button></span>' +
        '<input type="range" min="' + this.min + '" max="' + this.max + '" class="column gutter-left" placeholder="Value" data-hook="value" />' +
      '</span>' +
      '<span class="column columns mapping">' +
        '<input type="text" class="column gutter-right" placeholder="Events" data-hook="mapping" />' +
        '<span class="column gutter-left no-grow"><button name="clear-mapping" class="vfi-trash-empty"></button></span>' +
      '</span>' +
    '</div>';
  }
});

MappingControlView.rotateX =
MappingControlView.rotateY =
MappingControlView.rotateZ = MappingControlView.range.extend({
  min: 0,
  max: 360
});


MappingControlView.shadowBlur = MappingControlView.range.extend({
  min: 0,
  max: 50
});

MappingControlView.scaleX =
MappingControlView.scaleY = MappingControlView.range.extend({
  min: -10,
  max: 10
});

MappingControlView.translateX =
MappingControlView.translateY =
MappingControlView.shadowOffsetX =
MappingControlView.shadowOffsetY = MappingControlView.range.extend({
  min: -100,
  max: 100
});


MappingControlView.opacity = MappingControlView.range.extend({});

// MappingControlView.blending = MappingControlView.extend({
//   template: '<div class="prop columns">' +
//       '<span class="column no-grow gutter-right"><button name="to-multi-mapping" class="vfi-attach"></button></span>' +
//       '<strong class="prop-name column gutter-horizontal"></strong>' +
//       '<span class="column columns">' +
//         '<span class="column no-grow gutter-horizontal"><button name="default-value" class="vfi-trash-empty"></button></span>' +
//         '<span class="column gutter-left" data-hook="value"></span>' +
//       '</span>' +
//       '<span class="column columns mapping">' +
//         '<input class="column gutter-right" placeholder="Events" data-hook="mapping" />' +
//         '<span class="column gutter-left no-grow"><button name="clear-mapping" class="vfi-trash-empty"></button></span>' +
//       '</span>' +
//     '</div>'
// });
module.exports = MappingControlView;