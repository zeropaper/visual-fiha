'use strict';
module.exports = function propNamesExtractor(state, excluded = []) {
  var def = state.constructor.prototype._definition;

  if (state.idAttribute) excluded.push(state.idAttribute);
  if (state.typeAttribute) excluded.push(state.typeAttribute);

  return Object.keys(def)
    .filter(function(key) {
      return excluded.indexOf(key) < 0;
    });
};