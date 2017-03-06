'use strict';

var State = require('ampersand-state');
var Collection = require('ampersand-collection');

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
    manufacturer: 'string',
    name: 'string'
  },

  session: {
    active: ['boolean', true, true],
    connection: 'string',
    state: 'string',
    type: 'string',
    id: 'string',
    version: 'string'
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
  // var setThrottled = throttle(function(name, velocity) {
  //   model.set(name, velocity);
  // }, 1000 / 16);
  var _mappings = getMappings(model.manufacturer, model.name);

  return function(MIDIMessageEvent) {
    if (!model.active) { return; }
    var info = _mappings(MIDIMessageEvent.data);
    // if (info.name) setThrottled(info.name, info.velocity);
    if (model.collection.parent && info.name) model.collection.parent.trigger('midi:change', model.id, info.name, info.velocity);
  };
}


var MIDIAccessState = State.extend({
  mappable: {
    source: ['inputs'],
    target: []
  },

  registerInput: function(info) {
    var accessState = this;
    var _mappings = getMappings(info.manufacturer, info.name);
    if (!_mappings) {
      if (info.name !== 'Midi Through Port-0') {
        // console..warn('Unrecognized MIDI controller %s from %s', info.name, info.manufacturer);
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

    model.on('all', function(evtName, name, velocity) {
      if (evtName.slice(0, 5) === 'midi:') accessState.trigger(name, velocity);
    });

    accessState.inputs.add(model);
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
      accessState.MIDIAccess.inputs.forEach(accessState.registerInput, accessState);
      accessState.trigger('change:inputs');
    }

    accessState.on('change:MIDIAccess', MIDIAccessChanged);

    if (typeof options.MIDIAccess === 'undefined') {
      if (!navigator.requestMIDIAccess) {
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
