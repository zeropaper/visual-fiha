'use strict';
var ScreenLayerState = require('./../state');
var Extractor = require('./extractor');

module.exports = ScreenLayerState.types.SVG = ScreenLayerState.extend({
  props: {
    svgStyles: ['object', true, function() { return {}; }],
    src: ['string', false, null]
  },
  session: {
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

  initialize: function() {
    var svgState = this;
    ScreenLayerState.prototype.initialize.apply(svgState, arguments);
    // svgState.listenToAndRun(svgState.styleProperties, 'change', function() {
    //   svgState.trigger('change:styleProperties', svgState, svgState.styleProperties, {styleProperties: true});
    // });

    // only load SVG content on the worker
    if (!svgState.hasDOM) {
      svgState.listenToAndRun(svgState, 'change:src', function() {
        if (svgState.src) svgState.loadSVG();
      });
    }
    // only create an extractor for the state used in the controller
    else if (svgState.isControllerState) {
      svgState.extractor = new Extractor({
        model: svgState
      });
    }
  },

  loadSVG: function(done) {
    var state = this;
    done = done || function(err/*, obj*/) {
      if (err) {
        state.content = '';
        console.warn(err.message);
      }
    };

    if (!state.src) {
      state.content = '';
      return done(new Error('No src to load for ' + state.getId() + ' SVG layer'));
    }

    fetch(state.src)
      .then(function(res) {
        return res.text();
      })
      .then(function(string) {
        state.set({
          content: string,
          styleProperties: [],
          svgStyles: {}
        });
        done(null, state);
      })
      .catch(done);
  },

  serialize: function() {
    var obj = ScreenLayerState.prototype.serialize.apply(this, arguments);
    obj.content = this.content;
    return obj;
  },

  toJSON: function() {
    var obj = ScreenLayerState.prototype.toJSON.apply(this, arguments);
    delete obj.content;
    return obj;
  }
});