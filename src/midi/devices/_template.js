'use strict';

function toPrct(val) {
  return (100 / 127) * (val || 0);
}

var mappings = {
  prefix: '<something>',

  type: {
    128: 'noteOn',
    144: 'noteOff',
    176: 'change',
    192: 'search',
    248: 'idle'
  },

  note: {
  },

  velocity: {
    0: function(type, note, velocity) {
      if (note > 23) {
        return false;
      }
      return velocity;
    },

    127: function(type, note, velocity) {
      if (note > 23) {
        return true;
      }
      return toPrct(velocity);
    }
  },

  signalNames: [
  ]
};



module.exports = function(data) {
  var type = data[0] || 0;
  if (type === 248) { return {}; }

  var note = data[1] || 0;
  var velocity = data[2] || 0;

  var name = mappings.note[note];
  console.info('MIDI evt on %s (%s) => %s', name, note, velocity, type);
  return {
    name: name,
    velocity: velocity,
    type: type
  };
};