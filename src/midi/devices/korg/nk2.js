'use strict';

function toPrct(val) {
  return (100 / 127) * (val || 0);
}

var mappings = {
  prefix: 'nk2',

  type: {
    128: 'noteOn',
    144: 'noteOff',
    176: 'change',
    192: 'search',
    248: 'idle'
  },

  note: {
    0: 'slider1',
    1: 'slider2',
    2: 'slider3',
    3: 'slider4',
    4: 'slider5',
    5: 'slider6',
    6: 'slider7',
    7: 'slider8',

    16: 'knob1',
    17: 'knob2',
    18: 'knob3',
    19: 'knob4',
    20: 'knob5',
    21: 'knob6',
    22: 'knob7',
    23: 'knob8',

    32: 's1',
    33: 's2',
    34: 's3',
    35: 's4',
    36: 's5',
    37: 's6',
    38: 's7',
    39: 's8',

    41: 'play',
    42: 'stop',
    43: 'rewind',
    44: 'forward',
    45: 'record',
    46: 'cycle',

    48: 'm1',
    49: 'm2',
    50: 'm3',
    51: 'm4',
    52: 'm5',
    53: 'm6',
    54: 'm7',
    55: 'm8',

    58: 'trackprevious',
    59: 'tracknext',
    60: 'markerset',
    61: 'markerprevious',
    62: 'markernext',

    64: 'r1',
    65: 'r2',
    66: 'r3',
    67: 'r4',
    68: 'r5',
    69: 'r6',
    70: 'r7',
    71: 'r8'
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
  // console.info('MIDI evt on %s (%s) => %s', name, note, velocity, type);
  return {
    name: name,
    velocity: velocity,
    type: type
  };
};
module.exports.note = mappings.note;
module.exports.prefix = mappings.prefix;
