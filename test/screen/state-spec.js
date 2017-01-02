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
      describe('layers', function () {
        var instance;

        before(function () {
          instance = new ScreenState({
            layers: [
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
          expect(instance.layers.models).to.be.ok();
          expect(instance.layers.length).to.be(2);
          expect(instance.layers.at(0).name).to.be('Layer A');
        });
      });
    });

    describe('methods', function() {
      var instance;
      before(function () {
        instance = new ScreenState({
          layers: [
            {
              type: 'canvas'
            }
          ]
        });
      });

      describe('toJSON', function() {
        it('can be used used prepare data to send or store', function() {
          var obj = instance.toJSON();
          expect(function() {
            JSON.stringify(obj);
          }).not.to.throwException();
          expect(obj).to.be.an('object');
          expect(obj).to.have.keys(['layers']);
          expect(obj.layers).to.have.length(1);
        });
      });
    });
  });
});