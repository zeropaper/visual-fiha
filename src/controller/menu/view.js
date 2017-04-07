'use strict';
var View = require('ampersand-view');
var GistView = require('./gist-view');
var LocalforageView = require('./localforage-view');

var MenuView = View.extend({
  template: `
    <div class="vf-app-menu">
      <button name="menu-close" class="vfi-cancel"></button>

      <div class="inner rows">
        <div class="row no-grow columns" data-hook="localforage"></div>
        <div class="row no-grow columns" data-hook="gist"></div>

        <div class="row columns"></div>

        <div class="row columns">

        </div>
      </div>

      <div class="underlay"></div>
    </div>
  `,

  session: {
    opened: ['boolean', true, false]
  },

  bindings: {
    opened: {
      type: 'booleanClass'
    }
  },

  events: {
    'click [name=menu-close]': 'close',
    'click .underlay': 'close'
  },

  close: function() {
    this.opened = false;
  },

  open: function() {
    this.opened = true;
  },

  subviews: {
    localforageView: {
      waitFor: 'el',
      selector: '[data-hook=localforage]',
      prepareView: function() {
        var controllerView = this.parent;
        var view = new LocalforageView({parent: controllerView, model: controllerView.model});
        return view;
      }
    },

    gistView: {
      waitFor: 'el',
      selector: '[data-hook=gist]',
      prepareView: function() {
        var controllerView = this.parent;
        var view = new GistView({parent: controllerView, model: controllerView.model});
        return view;
      }
    }
  }
});
module.exports = MenuView;