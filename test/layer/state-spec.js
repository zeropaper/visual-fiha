'use strict';
function warn(e) {console.warn(e);}
describe('Layer State', function () {
  var defaultLayerProperties = [
    'active',
    'backfaceVisibility',
    'mappings',
    'name',
    'opacity',
    'perspective',
    'originX',
    'originY',
    'rotateX',
    'rotateY',
    'rotateZ',
    'scaleX',
    'scaleY',
    // 'scaleZ',
    'skewX',
    'skewY',
    'translateX',
    'translateY',
    // 'translateZ',
    'type'
  ];
  var LayerState, instance;

  before(function (done) {
    if (typeof R === 'undefined') {
      LayerState = require('./../../src/layer/state');
      require('./../../src/layer/canvas/state');
      require('./../../src/layer/video/state');
      require('./../../src/layer/img/state');
      require('./../../src/layer/svg/state');
      return done();
    }
    R(function (require) {
      LayerState = require('./../src/layer/state');
      require('./../src/layer/canvas/state');
      require('./../src/layer/video/state');
      require('./../src/layer/img/state');
      require('./../src/layer/svg/state');
    }, done);
  });


  function makeInstance(setup) {
    return function() {
      instance = new LayerState[setup.type](setup);
    };
  }

  describe('default type', function () {
    var instance;
    before(function () {
      instance = new LayerState();
    });

    describe('instance', function () {
      describe('options', function() {});

      describe('methods', function() {

        describe('toJSON', function() {
          it('can be used to prepare data to send or store', function() {
            var obj = instance.toJSON();
            expect(JSON.stringify).withArgs(obj).not.to.throwException(warn);
            expect(obj).to.be.an('object');
            expect(obj).to.only.have.keys(defaultLayerProperties);
            expect(obj.type).to.be('default');
            expect(obj.mappings).to.be.an('array');
            expect(obj.opacity).to.be(1);
            expect(obj.rotateX).to.be(0);
            expect(obj.rotateY).to.be(0);
            expect(obj.rotateZ).to.be(0);
            expect(obj.translateX).to.be(0);
            expect(obj.translateY).to.be(0);
            expect(obj.scaleX).to.be(100);
            expect(obj.scaleY).to.be(100);
          });
        });
      });
    });
  });

  describe('options.type', function() {
    describe('canvas', function() {
      var instance;
      before(function () {
        instance = new LayerState.canvas({
          type: 'canvas',
          name: 'canvas layer'
        });
      });

      describe('instance', function () {
        describe('options', function() {});

        describe('methods', function() {

          describe('toJSON', function() {
            it('can be used to prepare data to send or store', function() {
              var obj = instance.toJSON();
              expect(function() {
                JSON.stringify(obj);
              }).not.to.throwException(warn);
              expect(obj).to.be.an('object');
              expect(obj).to.only.have.keys([
                'canvasLayers'
              ].concat(defaultLayerProperties));
              expect(obj.type).to.be('canvas');
              expect(obj.name).to.be('canvas layer');
              expect(obj.mappings).to.be.an('array');
              expect(obj.opacity).to.be(1);
              expect(obj.rotateX).to.be(0);
              expect(obj.rotateY).to.be(0);
              expect(obj.rotateZ).to.be(0);
              expect(obj.translateX).to.be(0);
              expect(obj.translateY).to.be(0);
              expect(obj.scaleX).to.be(100);
              expect(obj.scaleY).to.be(100);
            });
          });
        });
      });
    });



    describe('video', function() {
      it('is available as LayerState.video', function() {
        expect(LayerState.video).to.be.ok();
      });

      describe('instance', function () {
        describe('options', function() {
          expect(makeInstance({
            type: 'video'
          })).to.throwError();
        });
      });
    });



    describe('img', function() {
      it('is available as LayerState.img', function() {
        expect(LayerState.img).to.be.ok();
      });

      describe('instance', function () {
        describe('options', function() {
        });
      });
    });

    describe('SVG', function() {
      it('is available as LayerState.SVG', function() {
        expect(LayerState.SVG).to.be.ok();
      });

      describe('instance', function () {
        describe('options', function() {
        });
      });
    });
  });
});