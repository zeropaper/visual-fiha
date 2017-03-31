'use strict';
var State = require('ampersand-state');
var View = require('ampersand-view');
var Collection = require('ampersand-collection');
function noop() {}

var Step = State.extend({
  idAttribute: 'name',
  props: {
    title: ['string', false, null],
    name: ['string', true, null],
    text: ['string', true, null],
    selector: ['string', false, null],
    index: ['number', true, 0],
    prepare: ['any', false, function(){ return noop; }]
  }
});

var Steps = Collection.extend({
  model: Step,
  comparator: 'index'
});

var Tour = View.extend({
  autoRender: true,

  template: `
    <div class="tour">
      <div class="wrapper rows">
        <div class="row columns">
          <div class="column">
            <h3></h3>
          </div>
          <div class="column no-grow">
            <button title="Leave the tour" class="no-border close vfi-cancel"></button>
          </div>
        </div>

        <div class="row text"></div>

        <div class="row view"></div>

        <div class="row columns">
          <div class="column no-grow">
            <button title="Previous step" class="no-border previous vfi-left-open"></button>
          </div>

          <div class="column index"></div>

          <div class="column no-grow">
            <button title="Next step" class="no-border next vfi-right-open"></button>
          </div>
        </div>
      </div>
    </div>
  `,

  props: {
    onstepchange: ['any', false, null],
    step: ['string', false, null],
    active: ['boolean', true, true]
  },

  collections: {
    steps: Steps
  },

  derived: {
    currentStep: {
      cache: false,
      deps: [],
      fn: function() {
        return this.steps.get(this.step) || this.steps.at(0);
      }
    },
    currentSelector: {
      cache: false,
      deps: [],
      fn: function() {
        return this.currentStep ? this.currentStep.selector : null;
      }
    },
    currentTitle: {
      cache: false,
      deps: [],
      fn: function() {
        return this.currentStep ? this.currentStep.title : null;
      }
    },
    currentText: {
      cache: false,
      deps: [],
      fn: function() {
        return this.currentStep ? this.currentStep.text : null;
      }
    },
    currentIndex: {
      cache: false,
      deps: [],
      fn: function() {
        return this.steps.indexOf(this.currentStep);
      }
    },

    previousStep: {
      cache: false,
      deps: [],
      fn: function() {
        return this.currentIndex > 0 ? this.steps.at(this.currentIndex - 1) : false;
      }
    },
    nextStep: {
      cache: false,
      deps: [],
      fn: function() {
        return this.steps.length > this.currentIndex ? this.steps.at(this.currentIndex + 1) : false;
      }
    },

    focusedEl: {
      cache: false,
      deps: [],
      fn: function() {
        return this.currentSelector ? document.querySelector(this.currentSelector) : false;
      }
    }
  },

  bindings: {
    active: {type: 'toggle'}
  },

  events: {
    'click button.close': '_closeTour',
    'click button.previous': '_goPrevious',
    'click button.next': '_goNext'
  },

  _closeTour: function() {
    this.active = false;
  },

  _goPrevious: function() {
    var state = this.steps.at(this.currentIndex - 1);
    this.step = state ? state.name : null;
  },

  _goNext: function() {
    var state = this.steps.at(this.currentIndex === -1 ? 1 : this.currentIndex + 1);
    this.step = state ? state.name : null;
  },

  initialize: function(options) {
    this.step = options.step;
    if (!this.step && this.currentStep) {
      this.set('step', this.currentStep.name);
    }
    this.listenToAndRun(this, 'change:step', this.update);
    this.listenToAndRun(this, 'change:rendered', this.setPosition);
    window.tour = this;
  },

  setPosition: function(el) {
    el = el && el.getBoundingClientRect ? el : this.focusedEl;
    if (!this.el || !this.currentStep || !el) {
      return this;
    }

    var style = this.el.style;
    var bdy = document.body;
    var focusedBox = el.getBoundingClientRect();
    var top = focusedBox.top;
    var left = focusedBox.left;
    var right = bdy.clientWidth - focusedBox.right;
    var bottom = bdy.clientHeight - focusedBox.bottom;
    var vertical = Math.max(top, bottom);
    var horizontal = Math.max(left, right);
    var screenRatio = bdy.clientWidth / bdy.clientHeight;

    var classList = this.el.classList;
    classList.remove('up');
    classList.remove('down');
    classList.remove('left');
    classList.remove('right');

    if (horizontal < (vertical * screenRatio)) {
      if (top >= bottom) {
        style.top = (top - this.el.clientHeight) +'px';
        classList.add('down');
      }
      else {
        style.top = focusedBox.bottom +'px';
        classList.add('up');
      }
      style.left = ((left + (focusedBox.width * 0.5)) - (this.el.clientWidth * 0.5)) +'px';
    }
    else {
      if (left >= right) {
        style.left = (left - this.el.clientWidth) +'px';
        classList.add('right');
      }
      else {
        style.left = focusedBox.right +'px';
        classList.add('left');
      }
      style.top = ((top + (focusedBox.height * 0.5)) - (this.el.clientHeight * 0.5)) +'px';
    }
    return this;
  },

  blinkFocused: function(el) {
    el = el && el.classList ? el : this.focusedEl;
    if (!el) return this;
    var classes = el.classList;
    el.addEventListener('animationend', function() {
      classes.remove('blink');
    });
    if (!classes.contains('blink')) {
      classes.add('blink');
    }
    return this;
  },

  update: function() {
    if (!this.el) return this;
    var view = this;
    var step = view.currentStep;
    if (!step) {
      view.el.style.display = 'none';
      return view;
    }
    view.el.style.display = null;

    view.query('.text').innerHTML = step.text;

    var titleEl = view.query('h3');
    titleEl.style.display = view.currentTitle ? null : 'none';
    titleEl.textContent = view.currentTitle;

    view.query('button.next').style.visibility = view.nextStep ? null : 'hidden';

    view.query('button.previous').style.visibility = view.previousStep ? null : 'hidden';

    view.query('.index').textContent = (view.currentIndex + 1) + ' / ' + view.steps.length;

    if (typeof step.prepare === 'function') {
      step.prepare.call(view, step);
    }
    if (typeof view.onstepchange === 'function') {
      view.onstepchange.call(view, step);
    }
    return view.setPosition().blinkFocused();
  },
});
module.exports = Tour;