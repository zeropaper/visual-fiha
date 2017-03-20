'use strict';
var Collection = require('ampersand-collection');
var State = require('ampersand-state');
var View = require('./../controller/control-view');
var uniq = require('lodash.uniq');

function filterEmpty(v) { return !!v; }

/**********************************************************************************\
 *                                                                                *
 *                                                                                *
\**********************************************************************************/
function sourceSuggestions(origin) {
  var results = [];
  if (!origin || typeof origin !== 'object') return results;

  var kepts = [];
  if (origin.mappable && origin.mappable.source) {
    kepts = (origin.mappable.source || []);
  }

  function filterKeys(key) {
    var excluded = [
      'mappable',
      'parent',
      'collection',
      origin.idAttribute,
      origin.typeAttribute
    ];
    return excluded.indexOf(key) < 0 && kepts.indexOf(key) > -1;
  }

  var proto = origin.constructor && origin.constructor.prototype ? origin.constructor.prototype : {};
  var propNames = Object.keys(proto._definition || {});
  var derivedNames = Object.keys(proto._derived || {});
  var childNames = Object.keys(proto._children || {});
  var collectionNames = Object.keys(proto._collections || {});

  propNames.concat(derivedNames, childNames)
    .filter(filterKeys)
    .forEach(function(key) {
      var sub = sourceSuggestions(origin[key]);
      if (!sub.length) {
        if (childNames.indexOf(key) < 0) {
          results.push(key);
        }
        return;
      }

      results = results.concat(sub.map(function(name) {
        return key + '.' + name;
      }));
    });

  kepts.concat(collectionNames)
    .filter(filterKeys)
    .forEach(function(collectionName) {
      if (!origin[collectionName] || typeof origin[collectionName].forEach !== 'function') return;

      origin[collectionName].forEach(function(model) {
        var id = model.getId();
        var suggestions = sourceSuggestions(model);
        results = results.concat(suggestions.filter(filterEmpty).map(function(name) {
          return collectionName + '.' + id + '.' + name;
        }));
      });
    });

  return uniq(results);
}


/**********************************************************************************\
 *                                                                                *
 *                                                                                *
\**********************************************************************************/
function targetSuggestions(origin) {
  var results = [];
  if (!origin || typeof origin !== 'object') return results;
  var kepts = [];
  if (origin.mappable && origin.mappable.target) {
    kepts = (origin.mappable.target || []);
  }

  function filterKeys(key) {
    var excluded = [
      'mappable',
      'parent',
      'collection',
      origin.idAttribute,
      origin.typeAttribute
    ];
    return excluded.indexOf(key) < 0 && kepts.indexOf(key) > -1;
  }

  var proto = origin.constructor && origin.constructor.prototype ? origin.constructor.prototype : {};
  var propNames = Object.keys(proto._definition || {});
  var childNames = Object.keys(proto._children || {});
  var collectionNames = Object.keys(proto._collections || {});

  propNames.concat(childNames)
    .filter(filterKeys)
    .forEach(function(key) {
      var sub = targetSuggestions(origin[key]);
      if (!sub.length) {
        if (childNames.indexOf(key) < 0) {
          results.push(key);
        }
        return;
      }

      results = results.concat(sub.map(function(name) {
        return key + '.' + name;
      }));
    });

  kepts.concat(collectionNames)
    .filter(filterKeys)
    .forEach(function(collectionName) {
      if (!origin[collectionName] || typeof origin[collectionName].forEach !== 'function') return;

      origin[collectionName].forEach(function(model) {
        var id = model.getId();
        var suggestions = targetSuggestions(model);
        results = results.concat(suggestions.filter(filterEmpty).map(function(name) {
          return collectionName + '.' + id + '.' + name;
        }));
      });
    });

  return uniq(results);
}


/**********************************************************************************\
 *                                                                                *
 *                                                                                *
\**********************************************************************************/
var EmitterTargetView = View.extend({
  template: `<div class="mapping-emitter-target-view columns">
  <div class="column"><input type="text" name="target-path" /></div>
  <div class="column no-grow"><button name="remove-target" class="vfi-trash-empty"></button></div>
</div>`,

  bindings: {
    'model.path': {
      type: 'value',
      selector: '[name="target-path"]'
    }
  },

  events: {
    'focus [name="target-path"]': '_handleTargetPathFocus',
    'change [name="target-path"]': '_handleTargetPathChange',
    'click [name="remove-target"]': '_handleRemoveTarget'
  },

  _handleTargetPathFocus: function(evt) {
    var targetView = this;
    var rootView = targetView.rootView;
    var suggestions = targetSuggestions({layers: rootView.model.layers, signals: rootView.signals, mappable: {target: ['layers', 'signals']}});
    var index = targetView.collection.indexOf(targetView.model);
    var mapping = targetView.parent.model;
    rootView.suggestionHelper.attach(evt.target, function(selected) {
      mapping.targets[index] = selected;
      targetView.parent.updateWorkerMapping();
      rootView.suggestionHelper.detach();
    }).fill(suggestions);
  },

  _handleTargetPathChange: function(evt) {
    this.model.path = evt.target.value;
    this.parent.updateWorkerMapping();
  },

  _handleRemoveTarget: function() {
    this.collection.remove(this.model);
    this.parent.updateWorkerMapping();
  }
});


/**********************************************************************************\
 *                                                                                *
 *                                                                                *
\**********************************************************************************/
var EmitterView = View.extend({
  initialize: function() {
    this.listenToAndRun(this.model, 'change:targets', function() {
      this.targets.reset((this.model.targets || []).map(function(path) {
        return {path: path};
      }));
    });
  },

  collections: {
    targets: Collection.extend({
      model: State.extend({
        props: {
          path: 'string'
        }
      })
    })
  },

  template: `<section class="mapping-emitter-view">
  <header class="columns">
    <div class="column emitter-name gutter"></div>
    <div class="column no-grow"><button name="edit-transform-function" class="vfi-code"></button></div>
    <div class="column"><input type="text" name="emitter-source" /></div>
    <div class="column no-grow"><button name="remove-emitter" class="vfi-trash-empty"></button></div>
  </header>
  <div class="columns">
    <div class="column"><input type="text" name="new-emitter-target" placeholder="new target path" /></div>
    <div class="column no-grow"><button name="add-emitter-target" class="vfi-plus"></button></div>
  </div>
  <div class="items"></div>
</section>`,

  bindings: {
    'model.name': '.emitter-name',
    'model.source': {
      type: 'value',
      selector: '[name="emitter-source"]'
    }
  },

  events: {
    'click [name="remove-emitter"]': '_handleRemoveEmitter',
    'focus [name="new-emitter-target"]': '_handleEmitterTargetPathFocus',
    'click [name="add-emitter-target"]': '_handleAddEmitterTarget',
    'click [name="edit-transform-function"]': '_handleEditEmitterTransform'
  },

  _handleRemoveEmitter: function() {
    this.rootView.sendCommand('removeMapping', {name: this.model.getId()});
  },

  updateWorkerMapping: function(serialized) {
    if (!serialized) {
      serialized = this.model.serialize();
      serialized.targets = this.targets.serialize().map(function(obj) { return obj.path; });
    }
    this.rootView.sendCommand('updateMapping', {mapping: serialized});
  },

  _handleEmitterTargetPathFocus: function(evt) {
    var view = this;
    var rootView = view.rootView;
    var suggestions = targetSuggestions({layers: rootView.model.layers, signals: rootView.signals, mappable: {target: ['layers', 'signals']}});

    rootView.suggestionHelper.attach(evt.target, function(selected) {
      evt.target.value = selected;
      view._handleAddEmitterTarget();
      rootView.suggestionHelper.detach();
    }).fill(suggestions);
  },

  _handleAddEmitterTarget: function() {
    var el = this.query('[name="new-emitter-target"]');
    if (this.model.targets.indexOf(el.value) < 0) {
      this.targets.add({path: el.value});
      this.updateWorkerMapping();
    }
    el.value = '';
  },

  _handleEditEmitterTransform: function() {
    var mappingView = this;
    var rootView = this.rootView;
    var editor = rootView.getEditor();
    var model = this.model;
    editor.editCode({
      script: (model.transformFunction || function(val) { return val; }).toString(),
      autoApply: true,
      language: 'javascript',
      onvalidchange: function doneEditingTransformFunction(str) {
        var mapping = model.serialize();
        mapping.transformFunction = str;
        mappingView.updateWorkerMapping(mapping);
      }
    });
  },

  subviews: {
    mappingsList: {
      waitFor: 'targets',
      selector: '.items',
      prepareView: function(el) {
        return this.renderCollection(this.targets, EmitterTargetView, el);
      }
    }
  },

  derived: {
    codeEditor: {
      deps: ['rootView'],
      fn: function () {
        return this.rootView.codeEditor;
      }
    }
  }
});


/**********************************************************************************\
 *                                                                                *
 *                                                                                *
\**********************************************************************************/
var MappingsControlView = View.extend({
  template: `<section class="mappings-view">
  <header>
    <div class="add-form columns">
      <div class="column add-form--name">
        <input placeholder="new mapping name" name="new-source-name" />
      </div>

      <div class="column add-form--source-path">
        <input placeholder="new source event" name="new-source-path" />
      </div>

      <div class="column no-grow">
        <button name="add-mapping" class="vfi-plus"></button>
      </div>
    </div>
  </header>

  <div class="items"></div>
</section>`,

  events: {
    'focus [name=new-source-path]': '_handleSourceFocus',
  },

  _handleSourceFocus: function(evt) {
    var rootView = this.rootView;
    var helper = rootView.suggestionHelper;
    var midiSources = this.rootView.midiSources();

    var results = [];
    rootView.signals.forEach(function(model) {
      var id = model.getId();
      results = results.concat(sourceSuggestions(model).filter(filterEmpty).map(function(name) {
        return 'signals.' + id + '.' + name;
      }));
    });

    results = midiSources.concat(results);

    helper.attach(evt.target, function(selected) {
      evt.target.value = selected;
      helper.detach();
    }).fill(results);
  },

  commands:{
    'click [name="add-mapping"]': 'addMapping _handleAddMapping'
  },

  _handleAddMapping: function() {
    return {
      mapping: {
        name: this.query('[name="new-source-name"]').value,
        source: this.query('[name="new-source-path"]').value
      }
    };
  },


  derived: {
    suggestionHelper: {
      deps: ['rootView'],
      fn: function () {
        return this.rootView.suggestionHelper;
      }
    }
  },

  render: function() {
    View.prototype.render.apply(this, arguments);
    this.mappingsList = this.renderCollection(this.collection, EmitterView, this.query('.items'));
    return this;
  }
});

module.exports = MappingsControlView;