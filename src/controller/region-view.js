'use strict';
/* global VFDeps*/
var State = VFDeps.State;
var View = VFDeps.View;
var Collection = VFDeps.Collection;
var ViewSwitcher = VFDeps.ViewSwitcher;

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

    if (item.active) return;
    item.collection.forEach(function(state) {
      state.active = item === state;
    });

    itemView.parent.currentView = item.view;
  },

  closeTab: function() {
    this.parent.focusTabIndex(0);
    this.model.collection.remove(this.model);
  }
});

var RegionView = View.extend({
  session: {
    currentView: 'state'
  },

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
          view: 'state'
        }
      })
    })
  },

  initialize: function() {
    this.listenToAndRun(this, 'change:currentView', function() {
      if (!this.currentView) return;
      this.render().regionSwitcher.set(this.currentView);
    });
  },

  autoRender: true,

  template: '<div class="region">' +
              '<ul class="region-tabs tabs"></ul>'+
              '<div class="region-content"></div>' +
            '</div>',

  render: function() {
    if (this.rendered) return this;

    this.renderWithTemplate();
    var options = {
      // waitForRemove: true,
      // hide: function(oldView, done) {
      //   console.info('hide', oldView, done);
      //   done();
      // },

      // empty: function() {
      //   console.info('empty region');
      // },

      show: function(newView) {
        // This should fix some rendering issues with the region-view
        var bindings = newView.constructor.prototype.bindings || {};
        Object.keys(bindings).forEach(function(key) {
          newView.trigger('change:' + key);
        }, newView);
      }
    };
    if (this.currentView) {
      options.view = this.currentView;
    }
    this.regionSwitcher = new ViewSwitcher(this.query('.region-content'), options);
    this.renderCollection(this.tabs, TabView, '.region-tabs');
    return this;
  },

  _focus: function(tabState) {
    if (!tabState || tabState.active) return;

    tabState.collection.forEach(function(state) {
      state.active = tabState === state;
    });

    this.currentView = tabState.view;

    tabState.view.trigger('change:model');
  },

  focusTabIndex: function(index) {
    this._focus(this.tabs.at(index));
  },

  focusTab: function(name) {
    this._focus(this.tabs.get(name));
  }
});

module.exports = RegionView;