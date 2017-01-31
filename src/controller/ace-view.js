'use strict';
var View = require('ampersand-view');
var AceEditor = View.extend({
  editCode: function(options) {
    if (!this.editor) this.render();
    options.original = options.script = options.script.toString();
    this.set(options);
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
    onvalidchange: 'any',
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
    language: {
      type: function() {
        if (!this.editor) return;
        this.editor.getSession().setMode('ace/mode/' + this.language);
      }
    },
    script: {
      type: function() {
        if (!this.editor) return;
        this.editor.setValue(this.script);
      }
    },
    pristine: {
      type: 'booleanClass',
      name: 'pristine'
    },
    autoApply: {
      selector: '[name=apply],[name=cancel]',
      type: 'toggle',
      invert: true
    }
  },

  setPristine: function() {
    if (this.original != this.script) this.original = this.script;
    return this;
  },

  _cleanup: function() {
    // delete this._cache = {};
    delete this._cache.changed;
    delete this._cache.original;

    this.trigger('change:changed');
    this.trigger('change:original');

    if (typeof this.onvalidchange === 'function') {
      this.unset('onvalidchange');
    }

    return this;
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

    function changed() {
      var errors = view.getErrors();
      if (errors.length) {
        return;
      }

      var str = editor.getValue();
      view.set('script', str, {silent: true});
      if (typeof view.onvalidchange === 'function') {
        view.onvalidchange(str);
      }
    }

    ace.require('ace/ext/language_tools');
    editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: false
    });

    editor.$blockScrolling = Infinity;
    editor.setTheme('ace/theme/monokai');
    editor.setShowInvisibles();
    editor.on('change', changed);

    var session = editor.getSession();

    session.on('changeAnnotation', changed);
    session.setMode('ace/mode/javascript');
    session.setUseSoftTabs(true);
    session.setTabSize(2);
    session.setUseWrapMode(true);

    if (view.original) {
      editor.setValue(view.original);
    }

    return view;
  },

  remove: function() {
    this.editor.destroy();
    return View.prototype.remove.apply(this, arguments);
  }
});
module.exports = AceEditor;