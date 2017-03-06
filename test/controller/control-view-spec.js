describe('Control View', function () {
  'use strict';
  function warn(e) {console.warn(e);}
  var expect = require('expect.js');
  var View = require('ampersand-view');
  var testUtils = require('./../test-utils');
  var ControlView = require('./../../src/controller/control-view');

  var RootViewMock = View.extend({
    _sentCommands: [],
    sendCommand: function(...args/*commandName, payload, callback*/) {
      console.info(...args);
      this._sentCommands.push(...args);
    }
  });

  var ExtendControlView = ControlView.extend({
    template: `
      <div>
        <button class=".click-test">Button</button>
        <input type="text" class=".input-test" />
      </div>
    `,

    commands: {
      'click .click-test': 'commandName methodName',
      'change .input-test': 'change inputChange'
    },

    methodName: function(evt) {
      console.info('methodName', evt);
    },

    inputChange: function(evt) {
      return evt.target.value;
    }
  });

  var instance, rootViewMock;

  function eachSetup() {
    rootViewMock = new RootViewMock();
    instance = new ExtendControlView({
      parent: rootViewMock
    });
  }

  function eachTearDown() {
    instance.remove();
    rootViewMock.remove();
  }

  beforeEach(eachSetup);

  afterEach(eachTearDown);

  describe('rootView', function () {
    it('is a derived property of the view', function () {
      expect(instance.rootView).to.be(rootViewMock);
    });

    it('has a sendCommand method', function() {
      expect(rootViewMock.sendCommand).to.be.a('function');
      expect(rootViewMock._sentCommands).to.be.an('array');
    });
  });

  describe('commands object', function() {
    it('is used to describe the events and commands binding', function() {
      instance.render();
      var info = instance._commands();
      expect(info).to.have.length(2);
      expect(info[0]).to.have.keys(['event', 'listener', 'listenerOptions', 'elements']);
    });
  });


  describe('bindCommands method', function() {
    var calledChangeEl = false;
    var calledCommandsBound = false;

    beforeEach(function () {
      instance.on('change:el', function() { calledChangeEl = true; });
      instance.on('commands:bound', function() { calledCommandsBound = true; });
    });

    it('is called when the view is rendered and triggers a commands:bound event', function() {
      instance.render();
      expect(calledChangeEl).to.be.ok();
      expect(calledCommandsBound).to.be.ok();
    });

    it('is also called when the .el property changes', function() {
      calledChangeEl = false;
      calledCommandsBound = false;
      instance.el = document.createElement('div');
      expect(calledChangeEl).to.be.ok();
      expect(calledCommandsBound).to.be.ok();
    });
  });
});