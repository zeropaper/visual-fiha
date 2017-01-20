'use strict';
var State = require('ampersand-state');
// var View = require('./control-view');
var View = require('ampersand-view');
var Collection = require('ampersand-collection');
var ViewSwitcher = require('ampersand-view-switcher');

var TabView = View.extend({
  template: '<li class="columns">' +
    '<div class="column gutter name"></div>' +
    '<div class="column no-grow">' +
      '<button class="vfi-minus-squared-alt"></button>' +
    '</div>' +
  '</li>',

  bindings: {
    'model.name': '.name',
    'model.active': {type: 'booleanClass', name: 'active'},
    'model.pinned': {type: 'toggle', selector: 'button', invert: true}
  },

  events: {
    'click .name': 'selectTab',
    'click button': 'closeTab'
  },

  selectTab: function() {
    var itemView = this;
    var item = itemView.model;
    itemView.parent._focus(item);
  },

  closeTab: function() {
    this.parent.focusTabIndex(0);
    this.model.collection.remove(this.model);
  }
});

var RegionView = View.extend({
  collections: {
    tabs: Collection.extend({
      mainIndex: 'name',

      find: function(fn) {
        for (var i = 0; i < this.length; i++) {
          if (fn(this.models[i])) return this.models[i];
        }
      },

      model: State.extend({
        idAttribute: 'name',

        session: {
          pinned: 'boolean',
          active: 'boolean',
          name: 'string',
          view: 'state',
          rebuild: 'any'
        }
      })
    })
  },

  autoRender: true,

  template: '<div class="region">' +
              '<ul class="region-tabs tabs"></ul>'+
              '<div class="region-content"></div>' +
            '</div>',

  activeIndex: function() {
    if (!this.tabs.models.length) return -2;
    for (var i = 0; i < this.tabs.models.length; i++) {
      if (this.tabs.models[i].active) return i;
    }
    return -1;
  },

  render: function() {
    if (this.rendered) return this;

    this.renderWithTemplate();

    this.regionSwitcher = new ViewSwitcher(this.query('.region-content'), {});

    this.renderCollection(this.tabs, TabView, '.region-tabs');

    this.listenToAndRun(this.tabs, 'reset add remove', function() {
      var activeIndex = this.activeIndex();
      if (activeIndex > -2) {
        this.focusTabIndex(activeIndex > -1 ? activeIndex : 0);
      }
    });

    return this;
  },

  _setView: function(view) {
    if (!view) return;
    this.regionSwitcher.set(view);
    return view;
  },

  _focus: function(tabState) {
    if (!tabState) return;
    this.tabs.forEach(function(state) {
      state.active = tabState === state;
    });

    var view = tabState.view;
    if (typeof tabState.rebuild === 'function') {
      view = tabState.rebuild();
    }
    if (typeof tabState.Constructor === 'function') {
      view = new tabState.Constructor({
        parent: this
      });

    }
    // else {
    //   view.trigger('change:model', view, view.model, {});
    //   view.trigger('change', view, view, {});
    //   var bindings = view.constructor.prototype.bindings || {};
    //   Object.keys(bindings).forEach(function(key) {
    //     view.trigger('change:' + key);
    //   }, view);
    // }
    this._setView(view);
  },

  focusTabIndex: function(index) {
    this._focus(this.tabs.at(index));
  },

  focusTab: function(name) {
    this._focus(this.tabs.get(name));
  }
});

module.exports = RegionView;