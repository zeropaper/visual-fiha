'use strict';
var View = window.VFDeps.View;
var AceEditor = View.extend({
  edit: function(target, propName) {
    if (target && propName) {
      this.set({
        model: target,
        targetProperty: propName
      });
    }
    this.script = this.original;
    this.editor.setValue(this.original);
  },

  template:
    '<div class="row debug rows">' +
      '<div class="ace-editor row grow-xl"></div>' +
      '<div class="ace-controls row no-grow gutter columns">' +
        '<div class="column"></div>' +
        '<div class="column no-grow gutter-right">' +
          '<button class="no" name="cancel">Cancel</button>' +
        '</div>' +
        '<div class="column gutter-left text-right">' +
          '<button class="yes" name="apply">Apply</button>' +
        '</div>' +
      '</div>' +
    '</div>',

  session: {
    editor: 'any',
    script: ['string', true, ''],
    targetProperty: 'string'
  },

  derived: {
    original: {
      deps: ['model', 'targetProperty'],
      fn: function() {
        return (this.model ? this.model[this.targetProperty] || '' : '').toString();
      }
    },
    changed: {
      deps: ['original', 'script'],
      fn: function() {
        return this.original != this.script;
      }
    }
  },

  bindings: {
    changed: {
      type: 'toggle',
      selector: 'button'
    }
  },

  events: {
    'click [name=cancel]': '_handleCancel',
    'click [name=apply]': '_handleApply'
  },

  _handleCancel: function(evt) {
    evt.preventDefault();
    if (!this.model || !this.targetProperty || !this.editor) return;

    this.editor.setValue(this.original);
  },

  _handleApply: function(evt) {
    evt.preventDefault();
    if (!this.model || !this.targetProperty || !this.editor) return;


    try {
      eval('var fn = ' + this.script +';');// jshint ignore:line
    }
    catch (err) {
      console.info('script error!', err.stack, err.message, err.line);
      return;
    }

    var m = this.model;
    var p = this.targetProperty;
    var s = this.script;

    m[p] = s;

    this._cache.changed = false;
    this.trigger('original:changed');
    this.trigger('change:changed');
  },

  render: function() {
    if (this.editor) { return this; }
    var view = this;
    view.renderWithTemplate();

    var editor = view.editor = window.ace.edit(view.query('.ace-editor'));
    editor.$blockScrolling = Infinity;
    editor.on('change', function() {
      view.set('script', editor.getValue());//, {silent: true});
    });
    editor.setTheme('ace/theme/monokai');
    editor.getSession().setMode('ace/mode/javascript');
    editor.setShowInvisibles();
    editor.getSession().setUseSoftTabs(true);
    editor.getSession().setTabSize(2);
    editor.getSession().setUseWrapMode(true);

    if (view.original) {
      editor.setValue(view.original);
    }

    return this;
  }
});
module.exports = AceEditor;