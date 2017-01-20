describe('Layer State', function () {
  'use strict';
  function warn(e) {console.warn(e);}
  var expect = require('expect.js');
  var LayerState = require('./../../src/layer/state');
  require('./../../src/layer/canvas/state');
  require('./../../src/layer/video/state');
  require('./../../src/layer/img/state');
  require('./../../src/layer/svg/state');

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
  var instance;


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
        instance = new LayerState.types.canvas({
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
      it('is available as LayerState.types.video', function() {
        expect(LayerState.types.video).to.be.ok();
      });

      describe('instance', function () {
        describe('options', function() {
          it('musts have type set to video', function() {
            expect(makeInstance({
              type: 'video'
            })).to.throwError();
          });
        });
      });
    });



    describe('img', function() {
      it('is available as LayerState.types.img', function() {
        expect(LayerState.types.img).to.be.ok();
      });

      describe('instance', function () {
        describe('options', function() {
        });
      });
    });

    describe('SVG', function() {
      it('is available as LayerState.types.SVG', function() {
        expect(LayerState.types.SVG).to.be.ok();
      });

      describe('instance', function () {
        describe('options', function() {
        });
      });
    });
  });
});