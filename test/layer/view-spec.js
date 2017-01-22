describe('Layer View', function () {
  'use strict';
  function warn(e) {console.warn(e);}

  var instance, holder;
  var expect = require('expect.js');
  var testUtils = require('./../test-utils');
  var ScreenView = require('./../../src/screen/view');
  var ScreenState = require('./../../src/screen/state');
  var LayerView = require('./../../src/layer/view');
  require('./../../src/layer/canvas/view');
  require('./../../src/layer/video/view');
  require('./../../src/layer/img/view');
  require('./../../src/layer/svg/view');

  before(function () {
    holder = testUtils.makeHolder('layer-view');
  });

  function makeInstance(setup) {
    return function() {
      var screen = new ScreenView({
        model: new ScreenState({
          layers: [
            setup
          ]
        })
      });

      instance = screen.model.layers.at(0);
      screen.render();
      holder.appendChild(screen.el);
    };
  }

  describe('options.type', function(){
    describe('canvas', function() {
      before(makeInstance({
        type: 'canvas',
        canvasLayers: [
          {
            name: 'First layer',
            drawFunction: function(ctx) {
              ctx.fillStyle = '#f00';
              ctx.fillRect(0, 0, this.width, this.height);
            },
            mappings: [
              {
                eventNames: 'mic:1',
                targetProperty: 'someProp'
              }
            ],
            props: {
              someProp: ['string', true, 'layer 1']
            }
          },
          {
            name: 'Second layer',
            drawFunction: function(ctx) {
              ctx.fillStyle = '#0f0';
              ctx.fillRect(0, 0, this.width, this.height);
            },
            mappings: [
              {
                eventNames: 'mic:2',
                targetProperty: 'someProp'
              }
            ],
            props: {
              someProp: ['string', true, 'layer 2']
            }
          }
        ]
      }));

      it('is available as LayerView.types.canvas', function() {
        expect(LayerView.types.canvas).to.be.ok();
      });

      describe('instance', function () {
        describe('options', function() {
          describe('canvasLayers', function() {
            it('describes the layers of the canvas composition', function() {
              expect(instance.canvasLayers.length).to.be(2);
            });
          });
        });

        describe('methods', function() {
          describe('update', function() {
            it('renders and composes the canvas layers');
          });
        });
      });
    });



    describe('video', function() {

      it('is available as LayerView.types.video', function() {
        expect(LayerView.types.video).to.be.ok();
      });

      describe('instance', function () {
        // before(makeInstance({
        //   type: 'video'
        // }));


        xit('requires a src attribute', function () {
          expect(makeInstance({
            type: 'video'
          })).to.throwError(warn);
        });


        describe('options', function() {
        });

        describe('methods', function() {
          describe('update', function() {
            it('renders');
          });
        });
      });
    });



    describe('img', function() {
      it('is available as LayerView.types.img', function() {
        expect(LayerView.types.img).to.be.ok();
      });

      describe('instance', function () {
        describe('options', function() {
        });

        describe('methods', function() {
          describe('update', function() {
            it('renders');
          });
        });
      });
    });

    describe('SVG', function() {
      it('is available as LayerView.types.SVG', function() {
        expect(LayerView.types.SVG).to.be.ok();
      });

      describe('instance', function () {
        describe('options', function() {
        });

        describe('methods', function() {
          describe('update', function() {
            it('renders');
          });
        });
      });
    });
  });
});
