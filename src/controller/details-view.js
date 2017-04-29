'use strict';
var assign = require('lodash.assign');
var Collection = require('ampersand-collection');
var State = require('ampersand-state');
var View = require('./control-view');
var objectPath = require('./../utils/object-path');
var propNamesExtractor = require('./../utils/prop-names');

var PropertyView = require('./property-view');

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
        <h5>Properties</h5>
        <div class="row items"></div>
      </div>
    </section>
  `,

  initialize: function() {
    this.listenToAndRun(this, 'change:definition', function() {
      this.properties.reset(this.definition);
    });

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

  render: function() {
    View.prototype.render.apply(this, arguments);

    if (this.propertiesView) {
      this.propertiesView.remove();
    }

    this.propertiesView = this.renderCollection(this.properties, function (opts) {
      var Constructor = (PropertyView.names[opts.model.name] || PropertyView.types[opts.model.type] || PropertyView);
      // console.info('property name: %s (%s), type: %s (%s)', opts.model.name, !!PropertyView.names[opts.model.name], opts.model.type, !!PropertyView.types[opts.model.type]);
      return new Constructor(opts);
    }, '.items');

    this.trigger('change:model');
    this.trigger('change:model.name');
    this.trigger('change:modelPath');
    return this;
  },

  bindings: {
    'model.name': '[data-hook=name]',
    'model.type': [
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
