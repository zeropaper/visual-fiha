webpackJsonp([4],{

/***/ 5:
/***/ function(module, exports, __webpack_require__) {

"use strict";

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

var nanoKONTROL2Mappings = {
  prefix: 'nk2',

  type: {
    176: 'change'
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
  },

  signalNames: [
    'slider1:change',
    'slider2:change',
    'slider3:change',
    'slider4:change',
    'slider5:change',
    'slider6:change',
    'slider7:change',
    'slider8:change',

    'knob1:change',
    'knob2:change',
    'knob3:change',
    'knob4:change',
    'knob5:change',
    'knob6:change',
    'knob7:change',
    'knob8:change',

    's1:change',
    's2:change',
    's3:change',
    's4:change',
    's5:change',
    's6:change',
    's7:change',
    's8:change',

    'play:change',
    'stop:change',
    'rewind:change',
    'forward:change',
    'record:change',
    'cycle:change',

    'm1:change',
    'm2:change',
    'm3:change',
    'm4:change',
    'm5:change',
    'm6:change',
    'm7:change',
    'm8:change',

    'trackprevious:change',
    'tracknext:change',
    'markerset:change',
    'markerprevious:change',
    'markernext:change',

    'r1:change',
    'r2:change',
    'r3:change',
    'r4:change',
    'r5:change',
    'r6:change',
    'r7:change',
    'r8:change'
  ]
};

var midiMappings = {
  'KORG INC.': {
    'KP3 MIDI 1': KP3Mappings,
    'nanoKONTROL2 MIDI 1': nanoKONTROL2Mappings
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
      deps: ['name', 'name'],
      fn: function() {
        var m = midiMappings || {};
        if (!m[this.manufacturer] || !m[this.manufacturer][this.name]) {
          return;
        }
        return m[this.manufacturer][this.name];
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

  if (!val) {
    return scope === 'velocity' ? toPrct(value) : value;
  }


  if (typeof val === 'function') {
    return val(data[0], data[1], data[2]);
  }

  return scope === 'velocity' ? toPrct(value) : val;
}

function handleMIDIMessage(accessState, model) {
  // function clear() {
  //   model.set({
  //     signalType: '',
  //     signalNote: '',
  //     signalVelocity: ''
  //   });
  // }

  return function(MIDIMessageEvent) {
    // if (!model.active) { return clear(); }

    var data = MIDIMessageEvent.data;
    var type = data[0] || 0;
    if (type === 248) { return; }

    var note = data[1] || 0;
    var velocity = data[2] || 0;

    var obj = {
      signalType:     _result(model.midiMapping, 'type', type, data),
      signalNote:     _result(model.midiMapping, 'note', note, data),
      signalVelocity: _result(model.midiMapping, 'velocity', velocity, data)
    };
    console.info('midi type: %s, note %s, velocity: %s', type, note, velocity, obj);

    var eventName = model.midiMapping.prefix + ':' + obj.signalNote + ':' + obj.signalType;
    accessState.trigger('midi', eventName, obj.signalVelocity/*, model, eventName*/);

    // model.set(obj);
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
      if (!navigator.requestMIDIAccess) {
        console.warn('No WebMIDI API support');
        accessState.MIDIAccess = false;
        return;
      }

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


/***/ },

/***/ 6:
/***/ function(module, exports, __webpack_require__) {

"use strict";

var VFDeps = window.VFDeps;
var View = VFDeps.View;
var MIDIView = View.extend({
  template: [
    '<li class="gutter">',
    '<span class="name"></span> ',
    '</li>'
  ].join(''),
  bindings: {
    'model.active': {
      type: 'booleanClass'
    },
    'model.state': '.state',
    'model.name': '.name'
  },

  events: {
    click: '_handleClick'
  },

  _handleClick: function() {
    this.model.toggle('active');
  }
});

var MIDIAccessView = View.extend({
  template:
    '<div class="midi-access">' +
      '<div class="midi-inputs">' +
        '<div class="gutter">Inputs</div>' +
        '<ul></ul>' +
      '</div>' +
    //   '<div class="midi-outputs">' +
    //     '<div class="gutter">Outputs</div>' +
    //     '<ul></ul>' +
    //   '</div>' +
    '</div>',

  render: function() {
    var originalClass;
    if (this.el) {
      originalClass = this.el.className;
    }
    this.renderWithTemplate();
    if (originalClass) {
      this.el.className = originalClass;
    }
    this.inputsView = this.renderCollection(this.model.inputs, MIDIView, '.midi-inputs ul');
    // this.outputsView = this.renderCollection(this.model.outputs, MIDIView, '.midi-outputs ul');
    return this;
  }
});

module.exports = MIDIAccessView;

/***/ }

});
//# sourceMappingURL=4-build.js.map