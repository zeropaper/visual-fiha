'use strict';
var VFDeps = window.VFDeps;

var State = VFDeps.State;
var Collection = VFDeps.Collection;

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

var KP3Mappings = {
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

var midiMappings = {
  'KP3 MIDI 1': {
    'ALSA library version 1.0.25' : KP3Mappings
  }
};


var MIDIState = State.extend({
  props: {
    connection: 'string',
    state: 'string',
    type: 'string',
    id: 'string',
    manufacturer: 'string',
    name: 'string',
    version: 'string'
  },

  session: {
    active: ['boolean', true, true]
  },

  derived: {
    midiMapping: {
      deps: ['name', 'type', 'version'],
      fn: function() {
        var m = midiMappings || {};
        if (!m[this.name] || !m[this.name][this.version]) {
          return;
        }
        return m[this.name][this.version];
      }
    },
    signalNames: {
      deps: ['midiMappings'],
      fn: function() {
        var prefix = this.midiMapping.prefix;
        return this.midiMapping.signalNames.map(function(str) {
          return prefix + ':' + str;
        });
      }
    }
  }
});

function _result(mapping, scope, value, data) {
  if (!mapping[scope]) { return value; }
  if (data[0] === 192) {
    if (scope === 'velocity') {
      return toPrct(data[1]);
    }
    else if (scope === 'note') {
      return 'bpmKnob';
    }
  }

  var val = mapping[scope][''+value];

  if (!val) { return scope === 'velocity' ? toPrct(value) : value; }


  if (typeof val === 'function') {
    return val(data[0], data[1], data[2]);
  }

  return scope === 'velocity' ? toPrct(value) : val;
}

function handleMIDIMessage(accessState, model) {
  function clear() {
    model.set({
      signalType: '',
      signalNote: '',
      signalVelocity: ''
    });
  }

  return function(MIDIMessageEvent) {
    if (!model.active) { return clear(); }

    var data = MIDIMessageEvent.data;
    var type = data[0] || 0;
    // if (type === 248) { return clear(); }

    var note = data[1] || 0;
    var velocity = data[2] || 0;

    var obj = {
      signalType:     _result(model.midiMapping, 'type', type, data),
      signalNote:     _result(model.midiMapping, 'note', note, data),
      signalVelocity: _result(model.midiMapping, 'velocity', velocity, data)
    };
    if (obj.type === 248) {
      console.info('248', obj.signalNote, obj.signalVelocity);
    }
    var eventName = model.midiMapping.prefix + ':' + obj.signalNote + ':' + obj.signalType;
    accessState.trigger('midi', eventName, obj.signalVelocity/*, model, eventName*/);

    // console.info('midi event', type, note, velocity, eventName);
    model.set(obj);
  };
}


function collectionSignalNames() {
  var sn = [];
  this.forEach(function (m) { //jshint ignore: line
    sn = sn.concat(m.signalNames);
  });
  return sn;
}
var MIDIAccessState = State.extend({
  initialize: function(options) {
    options = options || {};
    var accessState = this;

    // window.midiAccessView = this;

    function MIDIAccessChanged() {
      if (!accessState.MIDIAccess) {
        accessState.inputs.reset([]);
        accessState.outputs.reset([]);
        return;
      }

      var inputs = [];
      var outputs = [];
      var model;

      accessState.MIDIAccess.inputs.forEach(function(info) {
        model = new MIDIState({
          connection: info.connection,
          state: info.state,
          type: info.type,
          id: info.id,
          manufacturer: info.manufacturer,
          name: info.name,
          version: info.version
        });
        if (model.midiMapping) {
          if (typeof info.onmidimessage !== 'undefined') {
            info.onmidimessage = handleMIDIMessage(accessState, model);
          }

          inputs.push(model);
        }
      });

      accessState.MIDIAccess.outputs.forEach(function(info) {
        model = new MIDIState({
          connection: info.connection,
          state: info.state,
          type: info.type,
          id: info.id,
          manufacturer: info.manufacturer,
          name: info.name,
          version: info.version
        });

        if (model.midiMapping) {
          outputs.push(model);
        }
      });

      accessState.inputs.reset(inputs);
      accessState.outputs.reset(outputs);
    }

    accessState.on('change:MIDIAccess', MIDIAccessChanged);

    if (typeof options.MIDIAccess === 'undefined') {
      navigator.requestMIDIAccess()
        .then(function(MIDIAccess) {
          accessState.MIDIAccess = MIDIAccess;
          accessState.MIDIAccess.onstatechange = function(evt) {
            accessState.MIDIAccess = evt.currentTarget;
            MIDIAccessChanged();
          };
        }, function() {
          accessState.MIDIAccess = false;
        });
    }
  },

  session: {
    MIDIAccess: {
      type: 'any',
      default: false
    }
  },

  collections: {
    inputs: Collection.extend({
      signalNames: collectionSignalNames,
      model: MIDIState
    }),
    outputs: Collection.extend({
      //signalNames: collectionSignalNames,
      model: MIDIState
    })
  },

  toJSON: function() {
    var obj = {};
    obj.inputs = this.inputs.toJSON();
    obj.outputs = this.outputs.toJSON();
    return obj;
  },

  derived: {
    signalNames: {
      deps: ['inputs'/*, 'outputs'*/],
      fn: function () {
        return this.inputs.signalNames();//.concat(this.outputs.signalNames());
      }
    }
  }
});

module.exports = MIDIAccessState;
