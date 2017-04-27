'use strict';
var assign = require('lodash.assign');
var View = require('./control-view');
var objectPath = require('./../utils/object-path');
var propNamesExtractor = require('./../utils/prop-names');
var ParamView = require('./../parameter/view');


var DetailsView = View.extend({
  template: `
    <section class="row rows">
      <header class="row no-grow">
        <div class="columns">
          <h3 class="column">Details for <span data-hook="name"></span> <small data-hook="type"></small></h3>
        </div>
        <h5 data-hook="object-path"></h5>
      </header>

      <div class="rows row param-section">
        <h5>Parameters</h5>
        <div class="row columns">
          <div class="column"><input type="text" name="parameter-name" placeholder="param-a" /></div>
          <div class="column"><select name="parameter-type">
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="boolean">boolean</option>
            <option value="any">any</option>
          </select></div>
          <div class="column"><input type="text" name="parameter-default" placeholder="2px, 100%, ..." /></div>
          <div class="column no-grow"><button name="parameter-add" class="vfi-plus"></button></div>
        </div>
        <div class="row parameters" ></div>
      </div>
    </section>
  `,

  initialize: function() {
    this.listenTo(this.rootView, 'all', function(evtName) {
      if (evtName.indexOf('app:') === 0 && evtName.indexOf('Mapping') > 0) {
        this.trigger('change:model', this.model);
      }
      else if (evtName === 'blink') {
        if(this.modelPath === arguments[1]) this.blink();
      }
    });
  },

  derived: {
    propNames: {
      deps: ['model'],
      fn: function() {
        return propNamesExtractor(this.model, ['layerStyles']);
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
      deps: ['model'],
      fn: function() {
        return objectPath(this.model);
      }
    }
  },

  events: {
    'click [name=parameter-add]': 'addParameter'
  },

  addParameter: function() {
    var val = this.query('[name=parameter-default]').value;
    var props = this.model.parameters.serialize();
    props.push({
      name: this.query('[name=parameter-name]').value,
      type: this.query('[name=parameter-type]').value,
      default: val,
      value: val
    });

    this.rootView.sendCommand('propChange', {
      path: 'layers.' + this.model.getId(),
      property: 'parameters',
      value: props
    });
  },

  editFunction: function(propName) {
    var rootView = this.rootView;
    var path = objectPath(this.model);
    var script = this.model.get(propName) || ('function ' + propName + '() {\n}');
    rootView.getEditor({
      tabName: this.model.getId() + ' ' + propName,
      script: script,
      language: 'javascript',
      title: path + '.' + propName,
      onshoworigin: function() {
        rootView.trigger('blink', path);
      },
      autoApply: true,
      onvalidchange: function doneEditingFunction(str) {
        rootView.sendCommand('propChange', {
          path: path,
          property: propName,
          value: str
        });
      }
    });
  },

  render: function() {
    View.prototype.render.apply(this, arguments);

    if (this.parameters) {
      this.parameters.remove();
    }

    this.parameters = this.renderCollection(this.model.parameters, function (opts) {
      var Constructor = (ParamView.names[opts.model.name] || ParamView.types[opts.model.type] || ParamView);
      // console.info('property name: %s (%s), type: %s (%s)', opts.model.name, !!ParamView.names[opts.model.name], opts.model.type, !!ParamView.types[opts.model.type]);
      return new Constructor(opts);
    }, '.parameters');

    this.trigger('change:model');
    this.trigger('change:model.name');
    this.trigger('change:modelPath');
    return this;
  },

  bindings: {
    'model.name': '[data-hook=name]',
    'model.type': [
      {
        selector: '[name=parameter-type]',
        type: function(el, val) {
          if (document.activeElement === el) return;
          el.querySelectorAll('option').forEach(o => { o.selected = false; });
          var selectedOption = el.querySelector('option[value="' + val + '"]');
          if (selectedOption) selectedOption.selected = true;
        }
      },
      {
        selector: '[data-hook=type]',
        type: 'text'
      },
      {
        type: function(el, val, prev) {
          if (prev) el.classList.remove('details-' + prev);
          el.classList.add('details');
          el.classList.add('details-' + val);
        }
      }
    ],
    modelPath: '[data-hook="object-path"]'
  }
});

module.exports = DetailsView;
