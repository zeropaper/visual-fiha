'use strict';
var assign = require('lodash.assign');
var Collection = require('ampersand-collection');
var State = require('ampersand-state');
var View = require('./control-view');
var objectPath = require('./../object-path');

var PropertyView = require('./property-view');

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

    this.listenTo(this.rootView, 'all', function(evtName) {
      if (evtName.indexOf('app:') === 0 && evtName.indexOf('Mapping') > 0) {
        this.trigger('change:model', this.model);
      }
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
              'type'
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

  render: function() {
    View.prototype.render.apply(this, arguments);

    this.propertiesView = this.renderCollection(this.properties, function (opts) {
      var Constructor = (PropertyView.names[opts.model.name] || PropertyView.types[opts.model.type] || PropertyView);
      // console.info('property name: %s (%s), type: %s (%s)', opts.model.name, !!PropertyView.names[opts.model.name], opts.model.type, !!PropertyView.types[opts.model.type]);
      return new Constructor(opts);
    }, '.items');

    return this;
  },

  bindings: {
    'model.name': '[data-hook=name]',
    modelPath: '[data-hook="object-path"]'
  }
});
module.exports = DetailsView;
