'use strict';
var SuggestionItem = VFDeps.View.extend({
  template: '<li></li>',
  bindings: {
    'model.text': {type: 'text'}
  },
  events: {
    click: '_handleClick'
  },
  _handleClick: function (evt) {
    evt.preventDefault();
    this.parent.trigger('selected', this.model.value || this.model.text);
  }
});

var SuggestionView = VFDeps.View.extend({
  autoRender: true,

  attach: function (el, selectCb, newCollection) {
    this.inputEl = typeof el === 'string' ? this.parent.query(el) : el;
    selectCb = selectCb || function(selected) { this.inputEl.textContent = selected; this.detach(); }.bind(this);
    this.off('selected');
    this.once('selected', selectCb);

    if (newCollection) {
      if (newCollection.isCollection) {
        this.collection = newCollection;
      }
      else {
        this.collection.reset(newCollection);
      }
    }

    return this;
  },

  fill: function (arr) {
    this.collection.reset(arr.map(function (v) { return {text:v}; }));
    return this.filterCollection();
  },

  detach: function () {
    this.off('selected');
    this.unset('inputEl');
    this.collection.reset([]);
    return this;
  },

  filterCollection: function () {
    var update = [];
    if (!this.inputEl) {
      update = this.collection.serialize();
    }
    else {
      var inputElVal = this.inputEl.textContent || this.inputEl.value;

      if (!inputElVal) {
        update = this.collection.serialize();
      }
      else {
        update = this.collection.filter(function (suggestion) {
          return suggestion.text.indexOf(inputElVal) === 0;
        });
      }
    }

    this.suggestions.reset(update);

    return this;
  },

  session: {
    inputEl: 'element'
  },

  _handleInput: function() {
    this.filterCollection();
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
      view.el.style.textAlign = s.textAlign;
      if (s.textAlign === 'right') {
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

    this.collection = this.collection || new VFDeps.Collection([], {parent: this});

    this.on('change:collection', function () {
      this.listenToAndRun(this.collection, 'add remove reset', this.filterCollection);
    });

    this.listenTo(this.suggestions, 'add remove reset', this.resetPosition);

    var _handleInput = this._handleInput.bind(this);
    var _handleBlur = function(evt) {
      evt.preventDefault();
    }.bind(this);

    this.on('change:inputEl', function() {
      var previous = this.previousAttributes();
      if (previous.inputEl) {
        previous.inputEl.removeEventListener('blur', _handleBlur);
        previous.inputEl.removeEventListener('input', _handleInput);
        previous.inputEl.removeEventListener('change', _handleInput);
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
      inputEl.addEventListener('blur', _handleBlur);
      inputEl.addEventListener('input', _handleInput);
      inputEl.addEventListener('change', _handleInput);
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
        this.parent.el.addEventListener('click', _handleHolderClick);
      }
    });
  },

  collections: {
    suggestions: VFDeps.Collection.extend({
      model: VFDeps.State.extend({
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