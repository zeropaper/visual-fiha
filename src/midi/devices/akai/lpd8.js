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
    1: 'k1',
    2: 'k2',
    3: 'k3',
    4: 'k4',
    5: 'k5',
    6: 'k6',
    7: 'k7',
    8: 'k8',

    36: 'p1',
    38: 'p2',
    40: 'p3',
    41: 'p4',
    43: 'p5',
    45: 'p6',
    47: 'p7',
    48: 'p8',
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
  }
};

module.exports = function(data) {
  var type = data[0] || 0;
  if (type === 248) { return {}; }

  var note = data[1] || 0;
  var velocity = data[2] || 0;

  var name = mappings.note[note];
  console.info('MIDI evt on %s (%s) => %s', name, note, velocity, data);
  return {
    name: name,
    velocity: velocity,
    type: type
  };
};
module.exports.note = mappings.note;
module.exports.prefix = mappings.prefix;
