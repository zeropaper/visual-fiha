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
    'kp3:buttonA:noteOn',
    'kp3:buttonA:noteOff',
    'kp3:buttonB:noteOn',
    'kp3:buttonB:noteOff',
    'kp3:buttonC:noteOn',
    'kp3:buttonC:noteOff',
    'kp3:buttonD:noteOn',
    'kp3:buttonD:noteOff',

    'kp3:num1:noteOn',
    'kp3:num1:noteOff',
    'kp3:num2:noteOn',
    'kp3:num2:noteOff',
    'kp3:num3:noteOn',
    'kp3:num3:noteOff',
    'kp3:num4:noteOn',
    'kp3:num4:noteOff',
    'kp3:num5:noteOn',
    'kp3:num5:noteOff',
    'kp3:num6:noteOn',
    'kp3:num6:noteOff',
    'kp3:num7:noteOn',
    'kp3:num7:noteOff',
    'kp3:num8:noteOn',
    'kp3:num8:noteOff',

    'kp3:effectKnob:change',
    'kp3:effectSlider:change'
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
        return this.midiMapping.signalNames;
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
    if (type === 248) { return clear(); }

    var note = data[1] || 0;
    var velocity = data[2] || 0;


    var obj = {
      signalType:     _result(model.midiMapping, 'type', type, data),
      signalNote:     _result(model.midiMapping, 'note', note, data),
      signalVelocity: _result(model.midiMapping, 'velocity', velocity, data)
    };
    var eventName = 'kp3:' + obj.signalNote + ':' + obj.signalType;
    accessState.trigger(eventName, obj.signalVelocity/*, model, eventName*/);

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
      var entry;
      var model;

      for (entry in accessState.MIDIAccess.inputs) {
        model = new MIDIState({
          connection: entry[1].connection,
          state: entry[1].state,
          type: entry[1].type,
          id: entry[1].id,
          manufacturer: entry[1].manufacturer,
          name: entry[1].name,
          version: entry[1].version
        });

        if (model.midiMapping) {
          if (typeof entry[1].onmidimessage !== 'undefined') {
            entry[1].onmidimessage = handleMIDIMessage(accessState, model);
          }

          inputs.push(model);
        }
      }

      for (entry in accessState.MIDIAccess.outputs) {
        model = new MIDIState({
          connection: entry[1].connection,
          state: entry[1].state,
          type: entry[1].type,
          id: entry[1].id,
          manufacturer: entry[1].manufacturer,
          name: entry[1].name,
          version: entry[1].version
        });

        if (model.midiMapping) {
          outputs.push(model);
        }
      }

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
