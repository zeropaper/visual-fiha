'use strict';
var ScreenLayerState = require('./../state');

var State = require('ampersand-state');
var Collection = require('ampersand-collection');

var PropertyState = State.extend({
  idAttribute: 'name',

  mappable: {
    target: ['value']
  },

  props: {
    name: ['string', true, ''],
    value: ['string', false, ''],
    default: ['string', true, '']
  }
});

var PropertyCollection = Collection.extend({
  mainIndex: 'name',
  model: PropertyState
});

module.exports = ScreenLayerState.types.SVG = ScreenLayerState.extend({
  props: {
    svgStyles: ['object', true, function() { return {}; }],
    src: ['string', false, null],
    content: ['string', false, '']
  },

  derived: {
    mappable: {
      deps: [],
      fn: function() {
        return {
          source: [],
          target: [
            'active',
            'styleProperties'
          ]
        };
      }
    }
  },

  collections: {
    styleProperties: PropertyCollection
  },

  initialize: function() {
    ScreenLayerState.prototype.initialize.apply(this, arguments);
    this.listenTo(this.styleProperties, 'change', function() {
      this.trigger('change:styleProperties', this, this.styleProperties, {styleProperties: true});
    });
    this.listenTo(this, 'change:src', function() { this.loadSVG(); });
    if (this.src) this.loadSVG();
  },

  loadSVG: function(done) {
    var state = this;
    done = done || function(err/*, obj*/) {
      if (err) {
        state.content = '';
        console.warn(err.message);
      }
    };

    if (!this.src) {
      state.content = '';
      return done(new Error('No src to load for ' + this.getId() + ' SVG layer'));
    }

    fetch(this.src)
      .then(function(res) {
        return res.text();
      })
      .then(function(string) {
        state.content = string;
        done(null, state);
      })
      .catch(done);
  },

  toJSON: function() {
    var obj = ScreenLayerState.prototype.toJSON.apply(this, arguments);
    delete obj.content;
    delete obj.svgStyles;
    return obj;
  }
});