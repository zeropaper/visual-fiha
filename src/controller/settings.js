'use strict';
var assign = require('lodash.assign');

function Settings(name, defaults) {
  this.name = name;
  var loaded = {};
  try {
    loaded = JSON.parse(localStorage.getItem(name) || '{}');
  }
  catch (e) {
    console.warn('settings loading error', e);
  }
  this._vars = assign({}, defaults, loaded);
}

Settings.prototype._vars = {};

Settings.prototype.set = function(name, value) {
  console.info('settings set "%s"', name, value);
  this._vars[name] = value;
  try {
    localStorage.setItem(this.name, JSON.stringify(this._vars));
  }
  catch (e) {
    console.warn('error while trying to store %s', name, e);
  }
  return value;
};

Settings.prototype.get = function(name, defaultValue) {
  console.info('settings get "%s"', name, defaultValue);
  return this._vars[name] === undefined ? defaultValue : this._vars[name];
};

module.exports = Settings;