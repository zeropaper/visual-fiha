'use strict';

function toPrct(val) {
  return (100 / 127) * (val || 0);
}

var KP3ToggleButoons = [
  49,
  50,
  51,
  52,
  53,
  54,
  55,
  56,

  92,
  95
];

var KP3LetterButoons = [
  36,
  37,
  38,
  39
];

var mappings = {
  prefix: 'kp3',

  type: {
    128: 'noteOn',
    144: 'noteOff',
    176: 'change',
    192: 'search',
    248: 'idle'
  },

  note: {
    36: 'buttonA',
    37: 'buttonB',
    38: 'buttonC',
    39: 'buttonD',

    49: 'num1',
    50: 'num2',
    51: 'num3',
    52: 'num4',
    53: 'num5',
    54: 'num6',
    55: 'num7',
    56: 'num8',

    70: 'padX',
    71: 'padY',
    72: 'pad72',
    73: 'pad73',
    74: 'pad74',
    75: 'pad75',
    76: 'pad76',

    92: 'pad',
    93: 'effectSlider',
    94: 'effectKnob',
    95: 'hold'
  },

  velocity: {
    0: function(type, note, velocity) {
      if (KP3ToggleButoons.indexOf(note) > -1) {
        return false;
      }
      return velocity;
    },

    64: function(type, note, velocity) {
      if (KP3LetterButoons.indexOf(note) > -1) {
        return false;
      }
      return toPrct(velocity);
    },

    100: function(type, note, velocity) {
      if (KP3LetterButoons.indexOf(note) > -1) {
        return true;
      }
      return toPrct(velocity);
    },

    127: function(type, note, velocity) {
      if (KP3ToggleButoons.indexOf(note) > -1) {
        return true;
      }
      return toPrct(velocity);
    }
  },

  signalNames: [
    'buttonA:noteOn',
    'buttonA:noteOff',
    'buttonB:noteOn',
    'buttonB:noteOff',
    'buttonC:noteOn',
    'buttonC:noteOff',
    'buttonD:noteOn',
    'buttonD:noteOff',

    'num1:noteOn',
    'num1:noteOff',
    'num2:noteOn',
    'num2:noteOff',
    'num3:noteOn',
    'num3:noteOff',
    'num4:noteOn',
    'num4:noteOff',
    'num5:noteOn',
    'num5:noteOff',
    'num6:noteOn',
    'num6:noteOff',
    'num7:noteOn',
    'num7:noteOff',
    'num8:noteOn',
    'num8:noteOff',

    'pad:noteOn',
    'pad:noteOff',

    'padX:change',
    'padY:change',
    'pad72:change',
    'pad73:change',
    'pad74:change',
    'pad75:change',
    'pad76:change',

    'effectKnob:change',
    'effectSlider:change'
  ]
};

function _result(note, data) {
  // that sucks! KP3
  if (data[0] === 192) {
    return 'bpmKnob';
  }

  var val = mappings.note[''+note];

  if (typeof val === 'function') {
    return val(data[0], data[1], data[2]);
  }

  return val;
}

module.exports = function(data) {
  var type = data[0] || 0;
  if (type === 248) { return {}; }

  var note = data[1] || 0;
  var velocity = data[2] || 0;

  var name = _result(note, data);
  // console.info('MIDI evt on %s (%s) => %s', name, note, velocity, type);
  return {
    name: name,
    velocity: velocity,
    type: type
  };
};
module.exports.note = mappings.note;
module.exports.prefix = mappings.prefix;
