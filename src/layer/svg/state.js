'use strict';
var ScreenLayerState = require('./../state');
var Extractor = require('./extractor');

module.exports = ScreenLayerState.types.SVG = ScreenLayerState.extend({
  baseParameters: [
    {name: 'src', type: 'string', default: ''}
  ].concat(ScreenLayerState.prototype.baseParameters),

  props: {
    svgStyles: ['object', true, function() { return {}; }]
  },

  session: {
    content: ['string', false, '']
  },

  derived: {
    src: {
      deps: ['parameters.src'],
      fn: function() {
        return this.parameters.getValue('src');
      }
    },
    mappable: {
      deps: [],
      fn: function() {
        return {
          source: [],
          target: [
            'parameters'
          ]
        };
      }
    }
  },

  initialize: function() {
    var svgState = this;
    ScreenLayerState.prototype.initialize.apply(svgState, arguments);

    // load the svg string content from the worker only
    if (!svgState.hasDOM) {
      svgState.listenToAndRun(svgState, 'change:src', function() {
        svgState.set({content: ''}, {silent: true});
        svgState.loadSVG();
      });
    }

    // only create an extractor for the state used in the controller
    if (svgState.isControllerState) {
      svgState.listenToAndRun(svgState, 'change:content', function() {
        if (svgState.content) svgState.extractor = new Extractor({model: svgState});
      });
    }

    svgState.listenTo(svgState.screenState, 'app:broadcast:bootstrap', function() {
      svgState.loadSVG();
    });
  },

  loadSVG: function(done) {
    var state = this;
    done = done || function(err/*, obj*/) {
      if (err) {
        // console.warn(err.message);
        return;
      }
      // console.info('loaded');
    };

    var src = state.src;
    if (!src) {
      state.content = '';
      return done(new Error('No src to load for ' + state.getId() + ' SVG layer'), state);
    }

    fetch(src)
      .then(function(res) {
        return res.text();
      })
      .then(function(string) {
        state.content = string;
        done(null, state);
      })
      .catch(function(err) {
        state.content = '';
        done(err, state);
      });
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