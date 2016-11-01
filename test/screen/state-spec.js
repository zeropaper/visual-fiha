'use strict';
describe('Screen State', function () {
  var ScreenState;

  before(function (done) {
    if (typeof R === 'undefined') {
      ScreenState = require('./../../src/screen/state');
      return done();
    }
    R(function (require) {
      ScreenState = require('./../src/screen/state');
    }, done);
  });

  describe('instance', function () {
    describe('options', function () {
      describe('screenLayers', function () {
        var instance;

        before(function () {
          instance = new ScreenState({
            screenLayers: [
              {
                name: 'Layer A'
              },
              {
                name: 'Layer B'
              }
            ]
          });
        });

        it('defines the screen layers', function () {
          expect(instance.screenLayers.models).to.be.ok();
          expect(instance.screenLayers.length).to.be(2);
          expect(instance.screenLayers.at(0).name).to.be('Layer A');
        });
      });

      describe('screenSignals', function () {
        var instance;

        before(function () {
          instance = new ScreenState({
            screenSignals: [
              {
                name: 'Signal 1'
              },
              {
                name: 'Signal 2'
              }
            ]
          });
        });

        it('defines the screen signals', function () {
          expect(instance.screenSignals.models).to.be.ok();
          expect(instance.screenSignals.length).to.be(2);
          expect(instance.screenSignals.at(0).name).to.be('Signal 1');
        });
      });
    });

    describe('methods', function() {
      var instance;
      before(function () {
        instance = new ScreenState({
          screenLayers: [
            {
              type: 'canvas'
            }
          ],
          screenSignals: []
        });
      });

      describe('toJSON', function() {
        it('can be used used prepare data to send or store', function() {
          var obj = instance.toJSON();
          expect(function() {
            JSON.stringify(obj);
          }).not.to.throwException();
          expect(obj).to.be.an('object');
          expect(obj).to.have.keys(['screenLayers', 'screenSignals']);
          expect(obj.screenLayers).to.have.length(1);
          expect(obj.screenSignals).to.have.length(0);
        });
      });
    });
  });
});