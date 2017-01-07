'use strict';
var View = window.VFDeps.View;
var AceEditor = View.extend({
  edit: function(target, propName, defaultValue, targetName) {
    if (!this.editor) this.render();
    this.set({
      model: target,
      targetProperty: propName,
      targetName: targetName || ((target.name || '') + propName)
    });
    this.script = this.original;
    this.editor.setValue(this.original || defaultValue);
  },

  template:
    '<section class="row code-editor rows">' +
      '<header>' +
        '<h3></h3>' +
      '</header>' +
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
    '</section>',

  session: {
    editor: 'any',
    script: ['string', true, ''],
    targetName: 'string',
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
    targetName: 'header>h3',
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

    this.model.set(this.targetProperty, this.script);

    delete this._cache.changed;
    delete this._cache.original;
    this.model.trigger('change:' + this.targetProperty);
    this.trigger('change:changed');
    this.trigger('change:original');
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
    editor.setShowInvisibles();

    var session = editor.getSession();
    session.setMode('ace/mode/javascript');
    session.setUseSoftTabs(true);
    session.setTabSize(2);
    session.setUseWrapMode(true);

    if (view.original) {
      editor.setValue(view.original);
    }

    return this;
  }
});
module.exports = AceEditor;