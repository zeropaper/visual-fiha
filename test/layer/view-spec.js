'use strict';
function warn(e) {console.warn(e);}

describe.skip('Layer View', function () {
  var ScreenView, ScreenState, LayerView, instance, holder;

  before(function (done) {
    holder = document.createElement('div');
    holder.className = 'layers-test-holder';
    document.getElementById('holder').appendChild(holder);

    if (typeof R === 'undefined') {
      ScreenView = require('./../../src/screen/view');
      ScreenState = require('./../../src/screen/state');
      LayerView = require('./../../src/layer/view');
      require('./../../src/layer/canvas/view');
      return done();
    }
    R(function (require) {
      ScreenView = require('./../src/screen/view');
      ScreenState = require('./../src/screen/state');
      LayerView = require('./../src/layer/view');
      require('./../src/layer/canvas/view');
    }, done);
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

      it('is available as LayerView.canvas', function() {
        expect(LayerView.canvas).to.be.ok();
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

      it('is available as LayerView.video', function() {
        expect(LayerView.video).to.be.ok();
      });

      describe('instance', function () {
        // before(makeInstance({
        //   type: 'video'
        // }));


        it('requires a src attribute', function () {
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
      it('is available as LayerView.img', function() {
        expect(LayerView.img).to.be.ok();
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
      it('is available as LayerView.SVG', function() {
        expect(LayerView.SVG).to.be.ok();
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
