'use strict';
var View = require('ampersand-view');
var GistView = require('./gist-view');
var ControlScreenControls = require('./control-screen-controls-view');
var LocalforageView = require('./localforage-view');

var MenuView = View.extend({
  template: `
    <div class="vf-app-menu">
      <button name="menu-close" class="vfi-cancel"></button>

      <div class="inner rows">
        <div class="row no-grow columns" data-hook="control-screen-controls"></div>

        <div class="row columns"></div>

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
    controlScreenControls: {
      waitFor: 'el',
      selector: '[data-hook=control-screen-controls]',
      prepareView: function() {
        var controllerView = this.parent;
        var router = controllerView.router;
        var settings = router.settings;

        if (router) {
          controllerView.set({
            showControlScreen: settings.get('showControlScreen', true),
            controlScreenWidth: settings.get('controlScreenWidth', 45),
            controlScreenHeight: settings.get('controlScreenHeight', 45)
          });
        }

        var view = new ControlScreenControls({
          active: controllerView.showControlScreen,
          width: controllerView.controlScreenWidth,
          height: controllerView.controlScreenHeight,
          parent: controllerView
        });

        this.listenToAndRun(view, 'change:active', function() {
          controllerView.showControlScreen = view.active;
          if (router) {
            settings.set('showControlScreen', controllerView.showControlScreen);
          }
        });
        this.listenToAndRun(view, 'change:width', function() {
          controllerView.controlScreenWidth = view.width;
          if (router) {
            settings.set('controlScreenWidth', controllerView.controlScreenWidth);
          }
        });
        this.listenToAndRun(view, 'change:height', function() {
          controllerView.controlScreenHeight = view.height;
          if (router) {
            settings.set('controlScreenHeight', controllerView.controlScreenHeight);
          }
        });
        return view;
      }
    },

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