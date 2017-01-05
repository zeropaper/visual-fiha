'use strict';
var View = VFDeps.View;
var Collection = VFDeps.Collection;
var State = VFDeps.State;

function sharedStart(array) {
  var A = array.concat().sort(),
      a1 = A[0],
      a2 = A[A.length-1],
      L = a1.length,
      i = 0;
  while(i < L && a1.charAt(i) === a2.charAt(i)) i++;
  return a1.substring(0, i);
}

var SuggestionItem = View.extend({
  template: '<li></li>',
  derived: {
    shortText: {
      deps: ['model.text', 'model.collection.parent'],
      fn: function() {
        return this.model.text.substring(this.model.collection.parent.commonStart.length);
      }
    }
  },
  bindings: {
    shortText: {type: 'text'}
  },
  events: {
    click: '_handleClick'
  },
  _handleClick: function (evt) {
    evt.preventDefault();
    this.parent.trigger('selected', this.model.value || this.model.text);
  }
});

var SuggestionView = View.extend({
  autoRender: true,

  attach: function (el, selectCb, newCollection) {
    this.inputEl = typeof el === 'string' ? this.parent.query(el) : el;
    selectCb = selectCb || function(selected) { this.inputEl.value = selected; this.detach(); }.bind(this);
    this.off('selected');
    this.once('selected', selectCb);

    this._makeHintEl();

    if (newCollection) {
      if (newCollection.isCollection) {
        this.collection = newCollection;
      }
      else {
        this.collection.reset(newCollection);
      }
    }

    this.filterCollection();

    return this;
  },

  fill: function (arr) {
    this.collection.reset(arr.map(function (v) { return {text:v}; }));
    return this.filterCollection();
  },

  detach: function () {
    this._removeHintEl();
    this.off('selected');
    this.unset('inputEl');
    this.collection.reset([]);
    return this;
  },

  filterCollection: function () {
    var update = [];
    if (!this.inputEl) {
      update = this.collection.models;
    }
    else {
      var inputElVal = this.inputEl.value || this.inputEl.value;

      if (!inputElVal) {
        update = this.collection.models;
      }
      else {
        update = this.collection.filter(function (suggestion) {
          return suggestion.text.indexOf(inputElVal) === 0;
        });
      }
    }

    if (update.length > 1) {
      this.commonStart = sharedStart(update.map(function(state) { return state.text; }));
    }
    else if (update.length/* === 1*/) {
      this.commonStart = update[0].text;
    }
    else {
      this.commonStart = '';
    }
    this.suggestions.reset(update);

    return this;
  },

  derived: {
    // creates an event listener with correct scope (ideal for add/removeEventListener)
    _handleHintClick: {
      deps: [],
      fn: function() {
        var view = this;
        return function() {
          if (!view.inputEl || !view.commonStart) return;
          view.inputEl.value = view.commonStart;
        };
      }
    },
    styles: {
      deps:['inputEl'],
      fn: function() {
        if (!this.inputEl) return {};
        return window.getComputedStyle(this.inputEl);
      }
    }
  },

  session: {
    commonStart: 'string',
    inputEl: 'element'
  },

  bindings: {
    commonStart: {
      type: function() {
        var el = this.suggestionHint;
        if (!el) return;
        el.textContent = this.commonStart;
      }
    }
  },

  _handleInput: function(evt) {
    // that way, autocomplete can be done using the Tab keyu
    if (evt.type === 'keydown' && evt.key === 'Tab' && this.commonStart !== this.inputEl.value) {
      evt.preventDefault();
    }

    if (evt.type !== 'keyup') return this.filterCollection();

    switch (evt.key) {
      case 'ArrowRight':
      case 'Tab':
        this._handleHintClick();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        console.info('suggestion input %s %s', evt.type, evt.key);
        break;
      default:
        this.filterCollection();
    }
  },

  _makeHintEl: function() {
    var parentNode = this.inputEl.parentNode;
    if (!parentNode) return this;
    this._removeHintEl();

    var div = this.suggestionHint = document.createElement('div');
    div.className = 'suggestion--hint';
    [
      'display',
      'paddingTop',
      'paddingBottom',
      'paddingLeft',
      'paddingRight',
      'marginTop',
      'marginBottom',
      'marginLeft',
      'marginRight',
      'top',
      'bottom',
      'left',
      'right',
      'borderWidth',
      'borderStyle',
      'lineHeight',
      'fontSize',
      'fontFamily',
      'textAlign',
      'color'
    ].forEach(function(copy) {
      div.style[copy] = this.styles[copy];
    }, this);

    div.style.cursor = 'pointer';
    div.style.pointerEvents = 'none';
    div.style.borderColor = 'transparent';
    div.style.position = 'absolute';
    div.style.zIndex = this.styles.zIndex + 1;
    div.style.opacity = 0.5;

    parentNode.appendChild(div);
    this.inputEl.addEventListener('click', this._handleHintClick);
  },

  _removeHintEl: function() {
    if (!this.suggestionHint || !this.suggestionHint.parentNode) return this;

    this.inputEl.removeEventListener('click', this._handleHintClick);
    this.suggestionHint.parentNode.removeChild(this.suggestionHint);
    this.suggestionHint = null;
    return this;
  },

  resetPosition: function() {
    var view = this;
    if (!view.el || !view.el.parentNode || !view.inputEl) { return view; }
    view.el.style.visibility = 'hidden';

    setTimeout(function () {
      if (!view.el || !view.el.parentNode || !view.inputEl) { return; }
      var ipos = view.inputEl.getBoundingClientRect();
      var bpos = view.el.getBoundingClientRect();

      if (ipos.top > view.el.parentNode.clientHeight * 0.5) {
        view.el.style.maxHeight = Math.min(ipos.top, view.el.parentNode.clientHeight * 0.33) + 'px';
        view.el.style.top = ((ipos.top - view.el.clientHeight) - 3) + 'px';
      }
      else {
        view.el.style.maxHeight = Math.min(ipos.bottom, view.el.parentNode.clientHeight * 0.33) + 'px';
        view.el.style.top = (ipos.bottom + 3) + 'px';
      }

      var s = window.getComputedStyle(view.inputEl);
      var exceed = view.el.parentNode && (bpos.left + bpos.width) > view.el.parentNode.clientWidth;
      view.el.style.textAlign = s.textAlign;
      if (s.textAlign === 'right' || exceed) {
        view.el.style.left = (ipos.left - (bpos.width - ipos.width)) + 'px';
      }
      else {
        view.el.style.left = (ipos.left) + 'px';
      }

      view.el.style.visibility = 'visible';
    });

    return view;
  },

  initialize: function () {
    if (!this.parent) { throw new Error('Suggestion view need a parent view'); }

    this.collection = this.collection || new Collection([], {parent: this});

    this.on('change:collection', function () {
      this.listenToAndRun(this.collection, 'add remove reset', this.filterCollection);
    });

    this.listenTo(this.suggestions, 'add remove reset', this.resetPosition);

    var _handleInput = this._handleInput.bind(this);

    this.on('change:inputEl', function() {
      var previous = this.previousAttributes();
      if (previous.inputEl) {
        previous.inputEl.removeEventListener('keydown', _handleInput);
        previous.inputEl.removeEventListener('keyup', _handleInput);
      }

      var list = this.el;
      var holderEl = this.parent.el;
      var inputEl = this.inputEl;

      if (!inputEl) {
        if (this.el && this.el.parentNode === holderEl) {
          holderEl.removeChild(this.el);
        }
        return;
      }

      if (!list || !holderEl) { return; }
      if (list.parentNode !== holderEl) {

        var holderElStyle = window.getComputedStyle(holderEl);
        if (holderElStyle.position === 'static') {
          holderEl.style.position = 'relative';
        }

        holderEl.appendChild(list);
      }

      this.resetPosition();
      inputEl.addEventListener('keydown', _handleInput, false);
      inputEl.addEventListener('keyup', _handleInput, false);
    });

    var _handleHolderClick = function (evt) {
      evt.preventDefault();
      if (evt.target !== this.inputEl && !this.el.contains(evt.target)) {
        this.detach();
      }
    }.bind(this);

    this.listenToAndRun(this.parent, 'change:el', function() {
      var previous = this.parent.previousAttributes();
      if (previous.el) {
        previous.el.removeEventListener('click', _handleHolderClick);
      }
      if (this.parent.el) {
        this.parent.el.addEventListener('click', _handleHolderClick, false);
      }
    });
  },

  collections: {
    suggestions: Collection.extend({
      model: State.extend({
        props: {
          text: ['string', true, ''],
          value: ['any', false, null]
        }
      })
    })
  },

  template: '<ul class="suggestion-view"></ul>',

  render: function () {
    this.renderWithTemplate();

    this.items = this.renderCollection(this.suggestions, SuggestionItem, this.el);

    return this;
  }
});
module.exports = SuggestionView;