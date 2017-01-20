'use strict';
var View = require('./../controller/control-view');

var ItemView = View.extend({
  template: '<div class="columns">' +
      '<div class="column no-grow"><button class="remove vfi-trash-empty"></button></div>'+

      '<div class="column source-path">' +
        '<input type="text" name="source-path" />' +
      '</div>' +

      '<div class="column gutter-vertical no-grow change-source"><span class="result-dot">&raquo;</span></div>'+
      '<div class="column no-grow"><button class="edit-transform-function vfi-cog-alt"></button></div>'+
      '<div class="column gutter-vertical no-grow change-target"><span class="result-dot">&raquo;</span></div>'+

      '<div class="column target-path">' +
        '<input type="text" name="target-path" />' +
      '</div>' +
    '</div>',


  derived: {
    codeEditor: {
      deps: ['rootView'],
      fn: function () {
        return this.rootView.codeEditor;
      }
    },
    suggestionHelper: {
      deps: ['rootView'],
      fn: function () {
        return this.rootView.suggestionHelper;
      }
    }
  },

  bindings: {
    'model.uiState': {
      type: 'class'
    },
    'model.sourcePath': {
      type: 'value',
      selector: '[name=source-path]'
    },
    'model.targetPath': {
      type: 'value',
      selector: '[name=target-path]'
    // },
    // 'model.sourceValue': {
    //   selector: '.change-source .result-dot',
    //   type: function(el, val) {
    //     el.classList.add('active');
    //     setTimeout(function() {
    //       el.classList.add('remove');
    //     }, 100);
    //     // console.info('sourceValue change for mapping %s: %s', this.model.cid, val);
    //   }
    // },
    // 'model.targetValue': {
    //   selector: '.change-target .result-dot',
    //   type: function(el, val) {
    //     el.classList.add('active');
    //     setTimeout(function() {
    //       el.classList.add('remove');
    //     }, 100);
    //     console.info('targetValue change for mapping %s: %s', this.model.cid, val);
    //   }
    }
  },

  events: {
    'focus [name=source-path]': '_handleSourcePathFocus',
    'focus [name=target-path]': '_handleTargetPathFocus',
    'blur [name=source-path]': '_handlePathBlur',
    'blur [name=target-path]': '_handlePathBlur',

    'click .remove': '_handleRemove',
    'click .edit-transform-function': '_handleEditTransformFunction',
    'change [name=target-path]': '_handleTargetPathChange'
  },

  _handleSourcePathFocus: function(evt) {
    var helper = this.suggestionHelper;
    var screenState = this.parent.model;
    var mappingState = this.model;

    helper.attach(evt.target, function(selected) {
      mappingState.updateInfo('source', selected, screenState);
      evt.target.value = selected;
      helper.detach();
    }).fill(this.collection.sourceSuggestions(screenState));
  },
  _handleTargetPathFocus: function(evt) {
    var helper = this.suggestionHelper;
    var screenState = this.parent.model;
    var mappingState = this.model;

    helper.attach(evt.target, function(selected) {
      mappingState.updateInfo('target', selected, screenState);
      evt.target.value = selected;
      helper.detach();
    }).fill(this.collection.targetSuggestions(screenState));
  },

  _handlePathBlur: function(evt) {
    evt.preventDefault();
  },

  _handleRemove: function() {
    this.model.collection.remove(this.model);
  },

  _handleEditTransformFunction: function() {
    var editor = this.rootView.getEditor();
    if (!editor.changed) {
      editor.edit(this.model, 'transformation', this.model.targetPath);
    }
    else {
      console.warn('A function is already being edited');
    }
  },

  _handleTargetPathChange: function(evt) {
    console.info(evt);
  }
});







var MappingsControlView = View.extend({
  template: '<section class="mappings-view">' +
      '<header>' +
        '<div class="add-form columns">' +
          '<div class="column add-form--source-path">' +
            '<input placeholder="Source" name="new-source-path" />' +
          '</div>' +

          '<div class="column gutter no-grow">&raquo;</div>' +

          '<div class="column add-form--target-path">' +
            '<input placeholder="Target" name="new-target-path" />' +
          '</div>' +

          '<div class="column no-grow">' +
            '<button name="add-mapping">Add</button>' +
          '</div>' +
        '</div>' +
      '</header>' +

      '<div class="items"></div>' +
    '</section>',


  validatePath: function(pathValue) {
    return typeof this.collection.resolve(pathValue, this.model) !== 'undefined';
  },

  subviews: {
    mappingsList: {
      waitFor: 'collection',
      selector: '.items',
      prepareView: function(el) {
        return this.renderCollection(this.collection, ItemView, el);
      }
    }
  },

  derived: {
    suggestionHelper: {
      deps: ['rootView'],
      fn: function () {
        return this.rootView.suggestionHelper;
      }
    }
  },

  events: {
    'focus [name=new-source-path]': '_handleSourceFocus',
    'focus [name=new-target-path]': '_handleTargetFocus',
    'click [name="add-mapping"]': '_handleAddMapping'
  },

  _handleSourceFocus: function(evt) {
    var helper = this.suggestionHelper;
    helper.attach(evt.target, function(selected) {
      evt.target.value = selected;
      helper.detach();
    }).fill(this.collection.sourceSuggestions(this.model));
  },

  _handleTargetFocus: function(evt) {
    var helper = this.suggestionHelper;
    helper.attach(evt.target, function(selected) {
      evt.target.value = selected;
      helper.detach();
    }).fill(this.collection.targetSuggestions(this.model));
  },



  _handleAddMapping: function(evt) {
    evt.preventDefault();

    var source = this.query('[name="new-source-path"]');
    var target = this.query('[name="new-target-path"]');

    if (!this.validatePath(source.value)) {
      console.warn('"%s" cannot be used as source path', source.value);
      return;
    }

    if(target.value && !this.validatePath(target.value)) {
      console.warn('"%s" cannot be used as target path', target.value);
      return;
    }

    this.collection.import([{
      source: source.value,
      target: target.value
    }], this.model);

    source.value = '';
    target.value = '';
  }
});


module.exports = MappingsControlView;