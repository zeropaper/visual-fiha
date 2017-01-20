/* global module, console */
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
    0: 'pA1',
    1: 'pA2',
    2: 'pA3',
    3: 'pA4',
    4: 'pA5',
    5: 'pA6',
    6: 'pA7',
    7: 'pA8',

    16: 'pB1',
    17: 'pB2',
    18: 'pB3',
    19: 'pB4',
    20: 'pB5',
    21: 'pB6',
    22: 'pB7',
    23: 'pB8',

    32: 'pC1',
    33: 'pC2',
    34: 'pC3',
    35: 'pC4',
    36: 'pC5',
    37: 'pC6',
    38: 'pC7',
    39: 'pC8',

    48: 'pD1',
    49: 'pD2',
    50: 'pD3',
    51: 'pD4',
    52: 'pD5',
    53: 'pD6',
    54: 'pD7',
    55: 'pD8',

    64: 'pE1',
    65: 'pE2',
    66: 'pE3',
    67: 'pE4',
    68: 'pE5',
    69: 'pE6',
    70: 'pE7',
    71: 'pE8',

    80: 'pF1',
    81: 'pF2',
    82: 'pF3',
    83: 'pF4',
    84: 'pF5',
    85: 'pF6',
    86: 'pF7',
    87: 'pF8',

    96: 'pI1',
    97: 'pI2',
    98: 'pI3',
    99: 'pI4',
    100: 'pI5',
    101: 'pI6',
    102: 'pI7',
    103: 'pI8',

    112: 'pJ1',
    113: 'pJ2',
    114: 'pJ3',
    115: 'pJ4',
    116: 'pJ5',
    117: 'pJ6',
    118: 'pJ7',
    119: 'pJ8',
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
module.exports.note = mappings.note;
module.exports.prefix = mappings.prefix;
