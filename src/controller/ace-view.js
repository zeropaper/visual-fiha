'use strict';
var View = require('ampersand-view');
var canvasCompleter = require('./../layer/canvas/canvas-completer');

var AceEditor = View.extend({
  editCode: function(options) {
    options.autoApply = !!options.autoApply;
    if (options.autoApply && typeof options.onvalidchange !== 'function') throw new Error('Missing onvalidchange function option');
    if (!options.autoApply && typeof options.onapply !== 'function') throw new Error('Missing onapply function option');
    options.original = options.script = options.script.toString();
    this._cleanup().set(options).render();
  },

  template: `
    <section class="row code-editor rows">
      <header>
        <div class="columns">
          <h3 class="column"><span data-hook="editor-title"></span> <small data-hook="editor-language"></small></h3>
          <div class="column no-grow show-origin"><button class="vfi-eye" name="show-origin"></button></div>
        </div>
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
    title: 'string',
    language: {
      type: 'string',
      values: ['javascript', 'yaml', 'css'],
      required: true,
      default: 'javascript'
    },
    autoApply: 'boolean',
    errors: 'array',
    editor: 'any',
    original: ['string', true, ''],
    script: ['string', true, ''],
    onshoworigin: 'any',
    onvalidchange: 'any',
    onapply: 'any',
    validator: 'any'
  },

  derived: {
    pristine: {
      deps: ['script', 'original'],
      fn: function() {
        return this.script === this.original;
      }
    }
  },

  bindings: {
    script: {
      type: function() {
        if (!this.editor) return;
        this.editor.setValue(this.script);
      }
    },

    pristine: [
      {
          type: 'booleanClass',
          name: 'pristine'
      },
      {
        selector: '[name=cancel]',
        type: 'booleanAttribute',
        name: 'disabled'
      },
      {
        selector: '[name=apply]',
        type: 'booleanAttribute',
        name: 'disabled'
      }
    ],

    autoApply: {
      type: 'booleanClass',
      name: 'autoapply'
    },

    onshoworigin: {
      type: 'toggle',
      selector: '.show-origin'
    },

    title: '[data-hook=editor-title]',
    language: '[data-hook=editor-language]'
  },

  events: {
    'click [name=show-origin]': '_showOrigin',
    'click [name="cancel"]': '_cancel',
    'click [name="apply"]': '_apply'
  },

  _showOrigin: function() {
    var fn = this.onshoworigin;
    if (typeof fn === 'function') fn();
  },

  setPristine: function() {
    if (this.original != this.script) this.original = this.script;
    return this;
  },

  _cleanup: function() {
    delete this._cache.changed;
    delete this._cache.original;

    if (typeof this.onvalidchange === 'function') {
      this.unset('onvalidchange');
    }
    if (typeof this.validator === 'function') {
      this.unset('validator');
    }

    return this;
  },

  validateScript: function(script) {
    var validator = this.validator;
    if (typeof validator === 'function') {
      return validator.call(this, script);
    }
  },

  getErrors: function() {
    return this.editor
      .getSession()
      .getAnnotations()
      .filter(function (annotation) {
        return annotation.type === 'error';
      });
  },

  _cancel: function() {},

  _apply: function() {
    var view = this;
    var editor = view.editor;
    var str = editor.getValue();
    if (typeof view.onapply === 'function') {
      view.onapply(str);
    }
    view.set('script', str, {silent: true});
    view.set('original', str, {silent: true});
    delete view._cache.pristine;
    view.trigger('change:pristine', view, view.script === view.original);
  },

  _makeEditor: function() {
    var view = this;
    var ace = window.ace;
    if (view.editor) view.editor.destroy();

    var hasAnnotations = ['javascript', 'css'].indexOf(view.language) > -1;
    var editor = view.editor = ace.edit(view.query('.ace-editor'));

    function changed() {
      var errors = view.getErrors();
      if (errors.length) {
        return;
      }

      var str = editor.getValue();
      if (view.autoApply && typeof view.onvalidchange === 'function' && view.script !== str) {
        view.onvalidchange(str);
      }
      view.set('script', str, {silent: true});
      delete view._cache.pristine;
      view.trigger('change:pristine', view, view.script === view.original);
    }

    editor.$blockScrolling = Infinity;
    editor.setTheme('ace/theme/monokai');
    editor.setShowInvisibles();
    editor.setFontSize(16);

    if (view.language === 'javascript') {
      var languageTools = ace.require('ace/ext/language_tools');
      editor.setOptions({
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: false
      });
      languageTools.addCompleter(canvasCompleter);
    }

    var session = editor.getSession();
    session.setMode('ace/mode/' + view.language);
    session.setUseSoftTabs(true);
    session.setTabSize(2);
    session.setUseWrapMode(true);

    if (hasAnnotations) {
      session.on('changeAnnotation', changed);
    }
    else {
      session.on('change', changed);
    }

    editor.setValue(view.script || view.original || '');

    return view;
  },

  render: function() {
    View.prototype.render.apply(this, arguments);

    this._makeEditor();

    return this;
  },

  remove: function() {
    this.editor.destroy();
    return View.prototype.remove.apply(this, arguments);
  }
});
module.exports = AceEditor;