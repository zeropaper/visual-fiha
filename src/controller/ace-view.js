'use strict';
var View = require('ampersand-view');
var AceEditor = View.extend({
  edit: function(target, propName, targetName) {
    if (!this.editor) this.render();
    this.unset('done');
    this.set({
      model: target,
      targetProperty: propName,
      targetName: targetName || ((target.name || '') + propName)
    });
    this.script = this.original;
    var session = this.editor.getSession();
    session.setMode('ace/mode/javascript');
    this.editor.setValue(this.original);
  },

  editCode: function(str, done, language) {
    if (!this.editor) this.render();
    if (language) {
      var session = this.editor.getSession();
      session.setMode('ace/mode/' + language);
    }
    this.unset(['model', 'targetProperty', 'targetName']);
    this.editor.setValue(str);
    this.done = done;
  },

  template: `
    <section class="row code-editor rows">
      <header>
        <h3></h3>
      </header>
      <div class="ace-editor row grow-xl"></div>
      <div class="ace-controls row no-grow gutter columns">
        <div class="column"></div>
        <div class="column no-grow gutter-right">
          <button class="no" name="cancel">Cancel</button>
          <button class="yes" name="apply">Apply</button>
        </div>
      </div>
    </section>
  `,

  session: {
    editor: 'any',
    script: ['string', true, ''],
    targetName: 'string',
    targetProperty: 'string',
    done: 'any'
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

  _cleanup: function(trigger) {
    delete this._cache.changed;
    delete this._cache.original;
    if (trigger) {
      this.trigger('change:changed');
      this.trigger('change:original');
    }
  },

  _handleCancel: function(evt) {
    evt.preventDefault();
    if (typeof this.done === 'function') {
      this._cleanup();
      this.unset('done');
      return;
    }
    if (!this.model || !this.targetProperty || !this.editor) return;

    this.editor.setValue(this.original);
  },

  _handleApply: function(evt) {
    evt.preventDefault();
    if (typeof this.done === 'function') {
      this.done(this.script);
      this._cleanup(true);
      return;
    }
    if (!this.model || !this.targetProperty || !this.editor) return;


    try {
      eval('var fn = ' + this.script +';');// jshint ignore:line
    }
    catch (err) {
      console.info('script error!', err.stack, err.message, err.line);
      return;
    }

    this.model.set(this.targetProperty, this.script);

    this._cleanup();
    this.model.trigger('change:' + this.targetProperty);
    this.trigger('change:changed');
    this.trigger('change:original');
  },

  getErrors: function() {
    return this.editor
      .getSession()
      .getAnnotations()
      .filter(function (annotation) {
        return annotation.type === 'error';
      });
  },

  render: function() {
    if (this.editor) { return this; }
    var view = this;
    view.renderWithTemplate();

    var ace = window.ace;
    var editor = view.editor = ace.edit(view.query('.ace-editor'));
    ace.require('ace/ext/language_tools');
    editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: false
    });

    editor.$blockScrolling = Infinity;
    editor.on('change', function() {
      var errors = view.getErrors();
      if (errors.length) {
        console.info('errors in the code', errors);
        return;
      }
      var str = editor.getValue();
      view.set('script', str);
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
  },

  remove: function() {
    this.editor.destroy();
    return View.prototype.remove.apply(this, arguments);
  }
});
module.exports = AceEditor;