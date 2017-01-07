'use strict';
var VFDeps = window.VFDeps;

var State = VFDeps.State;
var Collection = VFDeps.Collection;

var midiMappings = {
  'KORG INC.': {
    'KP3 MIDI 1': require('./devices/korg/kp3'),
    'nanoKONTROL2 MIDI 1': require('./devices/korg/nk2')
  },
  'AKAI professional LLC': {
    'LPD8 MIDI 1': require('./devices/akai/lpd8')
  },
  'Focusrite A.E. Ltd': {
    'Launchpad Mini MIDI 1': require('./devices/novation/lpm')
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
  }
});



function getMappings(manufacturer, name) {
  var m = midiMappings || {};
  if (!m[manufacturer] || !m[manufacturer][name]) {
    return;
  }
  return m[manufacturer][name] || function(){};
}


function handleMIDIMessage(accessState, model) {

  return function(MIDIMessageEvent) {
    if (!model.active) { return; }
    var _mappings = getMappings(model.manufacturer, model.name);

    var info = _mappings(MIDIMessageEvent.data);
    if (info.name) model.set(info.name, info.velocity);
  };
}


var MIDIAccessState = State.extend({
  mappable: {
    source: ['inputs'],
    target: []
  },

  registerInput: function(info) {
    var _mappings = getMappings(info.manufacturer, info.name);
    if (!_mappings) {
      if (info.name !== 'Midi Through Port-0') {
        console.warn('Unrecognized MIDI controller %s from %s', info.name, info.manufacturer);
      }
      return;
    }

    var props = {};
    var sources = [];

    Object.keys(_mappings.note || {}).forEach(function(key) {
      sources.push(_mappings.note[key]);
      props[_mappings.note[key]] = ['number', true, 0];
    });

    var Constructor = MIDIState.extend({
      mappable: {
        source: sources,
        target: []
      },
      props: props
    });

    var model = new Constructor({
      connection: info.connection,
      state: info.state,
      type: info.type,
      id: _mappings.prefix,//info.id,
      manufacturer: info.manufacturer,
      name: info.name,
      version: info.version
    });

    if (typeof info.onmidimessage !== 'undefined') {
      info.onmidimessage = handleMIDIMessage(this, model);
    }

    this.inputs.add(model);
  },

  initialize: function(options) {
    options = options || {};
    var accessState = this;


    function MIDIAccessChanged() {
      if (!accessState.MIDIAccess) {
        accessState.inputs.reset([]);
        return;
      }
      accessState.inputs.reset();
      accessState.MIDIAccess.inputs.forEach(accessState.registerInput.bind(accessState));
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
    })
  },

  toJSON: function() {
    var obj = {};
    obj.inputs = this.inputs.toJSON();
    return obj;
  }
});

module.exports = MIDIAccessState;
