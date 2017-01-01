'use strict';
var View = VFDeps.View;

var ItemView = View.extend({
  template: '<div class="columns">' +
      '<div class="column no-grow"><button class="remove vfi-trash-empty"></button></div>'+

      '<div class="column source-path">' +
        '<input type="text" name="source-path" />' +
      '</div>' +

      '<div class="column gutter-vertical no-grow">&raquo;</div>'+
      '<div class="column no-grow"><button class="edit-transform-function vfi-cog-alt"></button></div>'+
      '<div class="column gutter-vertical no-grow">&raquo;</div>'+

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
    'model.sourcePath': {
      type: 'value',
      selector: '[name=source-path]'
    },
    'model.targetPath': {
      type: 'value',
      selector: '[name=target-path]'
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
    helper.attach(evt.target, function(selected) {
      evt.target.value = selected;
      helper.detach();
    }).fill(this.collection.sourceSuggestions(this.parent.model));
  },
  _handleTargetPathFocus: function(evt) {
    var helper = this.suggestionHelper;
    helper.attach(evt.target, function(selected) {
      evt.target.value = selected;
      helper.detach();
    }).fill(this.collection.targetSuggestions(this.parent.model));
  },

  _handlePathBlur: function(evt) {
    evt.preventDefault();
  },

  _handleRemove: function() {
    this.model.collection.remove(this.model);
  },

  _handleEditTransformFunction: function() {
    var editor = this.codeEditor;
    if (!editor.changed) {
      editor.edit(this.model, 'transformation', 'function transform(val) {\n  return val;\n}', this.model.targetPath);
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
        '<h3 class="section-name">Mappings</h3>' +

        '<div class="add-form gutter-horizontal gutter-top columns">' +
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


  events: {
    'keyup [name="-path"]': '_handlePathUpdate',
    'click [name="add-mapping"]': '_handleAddMapping'
  },


  _handlePathUpdate: function() {
    //
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