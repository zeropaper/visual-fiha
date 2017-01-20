describe('Controller View', function () {
  'use strict';

  var holder, instance;
  var testUtils = require('./../test-utils');
  var expect = require('expect.js');
  var ControllerView = require('./../../src/controller/view');
  var ScreenState = require('./../../src/screen/state');

  function makeInstance() {
    if (instance) {
      instance.remove();
    }

    instance = new ControllerView({
      el: holder,
      model: new ScreenState({
        layers: [],
        signals: [],
        mappings: []
      })
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