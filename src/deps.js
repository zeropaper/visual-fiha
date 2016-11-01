'use strict';
/*jshint browserify: true*/
var VFDeps = module.exports = {};
VFDeps.ResizeSensor = require('css-element-queries/src/ResizeSensor');
VFDeps.assign = require('lodash.assign');
VFDeps.debounce = require('lodash.debounce');
VFDeps.throttle = require('lodash.throttle');
VFDeps.State = require('ampersand-state');
VFDeps.View = require('ampersand-view');
VFDeps.ViewSwitcher = require('ampersand-view-switcher');
VFDeps.Collection = require('ampersand-collection');
