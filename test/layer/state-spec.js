describe('Layer State', function () {
  'use strict';
  function warn(e) {console.warn(e.stack);}
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
    // 'opacity',
    // 'rotateX',
    // 'rotateY',
    // 'rotateZ',
    // 'scaleX',
    // 'scaleY',
    // 'skewX',
    // 'skewY',
    // 'translateX',
    // 'translateY',
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
          name: 'canvasScreenLayer',
          canvasLayers: [
            {
              name: 'first',
              drawFunction: 'function(){}'
            }
          ]
        });
      });

      describe('instance', function () {
        var canvasLayerProps = [
          'name',
          'canvasLayers',
          'clear'
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


        describe('derived properties', function() {
          var canvasLayer;
          before(function() {
            canvasLayer = instance.canvasLayers.get('first');
            // mock the screen layer
            canvasLayer.collection = {
              parent: {
                collection: {
                  parent: {
                    frametime: 10,
                    audio: {
                      bufferLength: 128,
                      frequency: new Uint8Array(128),
                      timeDomain: new Uint8Array(128)
                    }
                  }
                }
              }
            };
          });

          it('has a canvas layer', function() {
            expect(canvasLayer).to.be.ok();
            expect(canvasLayer.name).to.be('first');
          });

          describe('draw', function() {
            var ctx;
            before(function() {
              var cnv = document.createElement('canvas');
              ctx = cnv.getContext('2d');
              document.body.appendChild(cnv);
            });

            it('is a function', function() {
              expect(canvasLayer.draw).to.be.a('function');
            });

            'navigator window global document module exports'.split(' ').forEach(function(varName) {
              it('overrides "' + varName + '"', function() {
                var result;
                canvasLayer.drawFunction = `function() {
                  return ${ varName };
                }`;

                expect(function() {
                  result = canvasLayer.draw(ctx);
                }).withArgs().not.to.throwException(warn);
                expect(result).to.be(undefined);
              });
            });

            describe('scope global', function() {
              describe('log', function() {
                it('can be called to output something in the console', function() {
                  var result;
                  canvasLayer.drawFunction = `function(ctx) {
                    log('Hello!');
                  }`;
                  expect(function() {
                    result = canvasLayer.draw(ctx);
                  }).withArgs().not.to.throwException(warn);
                  expect(result).to.be(undefined);
                });
              });

              describe('txt', function() {
                it('draws a text', function() {
                  var result;
                  canvasLayer.drawFunction = `function withCtx() {
                    txt('Text!');
                  }`;
                  expect(function() {
                    result = canvasLayer.draw(ctx);
                  }).withArgs().not.to.throwException(warn);
                  expect(result).to.be(undefined);
                });
              });

              describe('dot', function() {
                it('draws a text', function() {
                  var result;
                  canvasLayer.drawFunction = `function withCtx() {
                    ctx.fillStyle = 'red';
                    dot();
                  }`;
                  expect(function() {
                    result = canvasLayer.draw(ctx);
                  }).withArgs().not.to.throwException(warn);
                  expect(result).to.be(undefined);
                });
              });

              describe('circle', function() {
                it('draws a text', function() {
                  var result;
                  canvasLayer.drawFunction = `function withCtx() {
                    ctx.lineWidth = 3;
                    circle();
                    return 2;
                  }`;
                  expect(function() {
                    result = canvasLayer.draw(ctx);
                  }).withArgs().not.to.throwException(warn);
                  expect(result).to.be(2);
                });
              });

              describe('ramda tools set', function() {
                it('is exposed', function() {
                  var result;
                  canvasLayer.drawFunction = `function withCtx() {
                    var returned = add(2, 3);
                    // log(returned);
                    return returned;
                  }`;
                  expect(function() {
                    result = canvasLayer.draw(ctx);
                  }).withArgs().not.to.throwException(warn);
                  expect(result).to.be(5);
                });
              });

              describe('2d context properties and methods', function() {
                it('are exposed', function() {
                  var result;
                  canvasLayer.drawFunction = `function withCtx() {
                    var returned = typeof lineWidth;
                    // log(returned);
                    return returned;
                  }`;
                  expect(function() {
                    result = canvasLayer.draw(ctx);
                  }).withArgs().not.to.throwException(warn);
                  expect(result).to.be('function');

                  canvasLayer.drawFunction = `function withCtx() {
                    var returned = typeof fill;
                    // log(returned);
                    return returned;
                  }`;
                  expect(function() {
                    result = canvasLayer.draw(ctx);
                  }).withArgs().not.to.throwException(warn);
                  expect(result).to.be('function');


                  canvasLayer.drawFunction = `function() {
                    lineWidth(5);
                    strokeStyle('#f00');
                    moveTo(width * 0.25, height * 0.25);
                    lineTo(width * 0.75, height * 0.75);
                    stroke();
                  }`;
                  expect(canvasLayer.draw).withArgs(ctx).not.to.throwException(warn);
                });
              });
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