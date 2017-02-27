'use strict';
var ScreenLayerState = require('./../state');
var tXML = require('txml');

function loadSVG(url, done) {
  done = done || function(err/*, obj*/) {
    console.warn(err.message);
  };

  fetch(url)
    .then(function(res) {
      return res.text();
    })
    .then(function(string) {
      done(null, string);
    })
    .catch(done);
}



module.exports = ScreenLayerState.types.SVG = ScreenLayerState.extend({
  props: {
    src: ['string', false, null]
  },

  session: {
    _loaded: 'string'
  },

  initialize: function() {
    ScreenLayerState.prototype.initialize.apply(this, arguments);
    this.on('change:src', function() {
      if (!this.src) return this.set('_loaded', '');

      loadSVG(this.src, function(err, loaded) {
        this.set('_loaded', err ? '' : loaded);
      });
    });
  },

  derived: {
    data: {
      deps: ['_loaded'],
      fn: function() {
        if (!this._loaded) {
          return {
            xml: '',
            styles: {}
          };
        }

        var styles = {};
        try {
          tXML(this._loaded, {
            filter: function(child) {
              return child.attributes && child.attributes.id && child.attributes.style;
            }
          }).forEach(function(node) {
            styles[node.attributes.id] = node.attributes.style;
          });
        }
        catch (e) {
          return {
            xml: '',
            styles: {}
          };
        }

        console.info('styles from %s', this.src, styles);
        return {
          xml: this._loaded,
          styles: styles
        };
      }
    }
  }
});