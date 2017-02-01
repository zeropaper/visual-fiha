describe('StateService', function () {
  'use strict';
  var StateService = require('./../src/state-service');
  var expect = require('expect.js');
  var service;

  function eachSetup() {
    service = StateService.service();
    service.reset([]);
  }

  it('has a service() method which returns a singelton', function() {
    expect(StateService.service).to.be.a('function');
    expect(function() {
      service = StateService.service();
    }).withArgs().not.to.throwException();
    expect(service).to.be.ok();
  });

  describe('register(archetypeName, Archetype)', function() {
    before(eachSetup);

    it('registers an Archetype', function() {
      expect(function () {
        service.register('TestState', require('ampersand-state').extend({
          props: {
            type: 'string',
            propA: 'any'
          }
        }));
      }).withArgs().not.to.throwException();
    });
  });

  describe('registerType()', function() {
    before(eachSetup);

    it('creates a subtype based on a Archetype', function() {
      expect(function () {
        service.registerType('TestState', 'variantA', {
          props: {
            propB: 'any'
          }
        });
      }).withArgs().not.to.throwException();
    });
  });

  describe('instanciate(archetypeName, attributes, options)', function() {
    before(eachSetup);

    it('creates an instance of the subtype', function() {
      expect(function () {
        service.instanciate('TestState', {
          type: 'variantA',
          propB: 'B'
        });
      }).withArgs().not.to.throwException();
    });

    it('creates an instance of the Archetype if the subtype is not determined', function() {
      expect(function () {
        service.instanciate('TestState', {
          propA: 'A'
        });
      }).withArgs().not.to.throwException();
      console.info('service.length', service.length);
    });
  });
});