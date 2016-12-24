'use strict';
function warn(e) {console.warn(e);}
describe('Layer State', function () {
  var defaultLayerProperties = [
    'active',
    // 'mappings',
    'mixBlendMode',
    'name',
    'opacity',
    'rotateX',
    'rotateY',
    'rotateZ',
    'scaleX',
    'scaleY',
    'skewX',
    'skewY',
    'translateX',
    'translateY',
    'type',
    'zIndex'
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
          var obj;

          before(function() {
            obj = instance.toJSON();
          });

          it('can be used to prepare data to send or store', function() {
            expect(function() {
              JSON.stringify(obj);
            }).not.to.throwException(warn);
          });

          it('has the ' + defaultLayerProperties.join(', '), function() {
            expect(obj).to.be.an('object');
            expect(obj).to.have.keys(defaultLayerProperties);
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
        var canvasLayerProps = [
          'canvasLayers'
        ].concat(defaultLayerProperties);

        describe('options', function() {});

        describe('methods', function() {

          describe('toJSON', function() {
            var obj;

            before(function() {
              obj = instance.toJSON();
            });

            it('can be used to prepare data to send or store', function() {
              expect(function() {
                JSON.stringify(obj);
              }).not.to.throwException(warn);
            });

            it('has the ' + canvasLayerProps.join(', ') + ' keys', function() {
              expect(obj).to.be.an('object');
              expect(obj).to.only.have.keys(canvasLayerProps);
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