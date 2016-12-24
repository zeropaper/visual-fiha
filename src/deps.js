'use strict';
/*jshint browserify: true*/
var VFDeps = window.VFDeps = module.exports = {};
VFDeps.assign = require('lodash.assign');
VFDeps.debounce = require('lodash.debounce');
VFDeps.throttle = require('lodash.throttle');
VFDeps.State = require('ampersand-state');
VFDeps.View = require('ampersand-view').extend({
  derived:{
    rootView:{
      deps:['parent'],
      fn: function() {
        for (var inst = this; inst; inst = inst.parent) {
          if (!inst.parent) { return inst; }
        }
      }
    }
  }
});
VFDeps.ViewSwitcher = require('ampersand-view-switcher');
VFDeps.Collection = require('ampersand-collection');
VFDeps.localForage = require('localforage');
VFDeps.localForage.config({
  // driver      : localforage.WEBSQL, // Force WebSQL; same as using setDriver()
  name        : 'visualFiha',
  version     : 1.0,
  size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
  storeName   : 'keyvaluepairs', // Should be alphanumeric, with underscores.
  description : 'Visual Fiha storage'
});
require('./EventListenerOptions.polyfill');