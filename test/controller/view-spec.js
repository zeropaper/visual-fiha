describe('Controller View', function () {
  'use strict';

  var holder, instance;
  var testUtils = require('./../test-utils');
  var expect = require('expect.js');
  var ControllerView = require('./../../src/controller/view');
  var ScreenState = require('./../../src/screen/state');
  var Settings = require('./../../src/controller/settings');
  var SignalCollection = require('./../../src/signal/collection');
  var Mappings = require('./../../src/mapping/data');
  var mockedRouter = {
    sendCommand: function(/*name, payload, callback*/) {},
    settings: new Settings('testvf')
  };
  require('ampersand-events').createEmitter(mockedRouter);



  function makeInstance() {
    if (instance) {
      instance.remove();
    }
    var screen = new ScreenState({
      layers: []
    });
    var signals = new SignalCollection([]);
    var mappings = new Mappings([], {
      context: {
        signals: signals,
        layers: screen.layers
      }
    });

    instance = new ControllerView({
      // midi: midi,
      el: holder,
      router: mockedRouter,
      signals: signals,
      mappings: mappings,
      model: screen
    });
  }

  before(function () {
    holder = testUtils.makeHolder('controller-view');
    makeInstance();
  });


  it('renders automatically', function() {
    expect(instance).to.be.ok();
    expect(instance.el).to.be.ok();
    expect(instance.rendered).to.be.ok();
  });

  it('is paused by default');

  it('does not show the control screen by default');


  describe('top right region', function() {
    var region;

    before(function() { region = instance.regionRight; });


    it('has tabs', function() {
      expect(region).to.be.ok();
      expect(region.el).to.be.ok();
      expect(region.rendered).to.be.ok();
      expect(instance.el.contains(region.el)).to.be.ok();
    });

    describe('layers tab', function() {

    });

    describe('signals tab', function() {

    });

    describe('code editor tab', function() {

    });
  });


  describe('bottom left region', function() {
    var region;

    before(function() { region = instance.regionLeftBottom; });


    it('has tabs', function() {
      expect(region).to.be.ok();
      expect(region.el).to.be.ok();
      expect(region.rendered).to.be.ok();
      expect(instance.el.contains(region.el)).to.be.ok();
    });

    describe('mappings tab', function() {});

    describe('MIDI tab', function() {});

    describe('Audio tab', function() {});
  });
});