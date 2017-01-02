'use strict';
describe.skip('Controller View', function () {
  var holder, ControllerView, ScreenView, ScreenState;

  before(function (done) {
    if (typeof R === 'undefined') {
      ControllerView = require('./../../src/controller/view');
      ScreenView = require('./../../src/screen/view');
      ScreenState = require('./../../src/screen/state');
      return done();
    }

    holder = document.createElement('div');
    holder.className = 'controller-test-holder';
    document.getElementById('holder').appendChild(holder);
    R(function (require) {
      ControllerView = require('./../src/controller/view');
      ScreenView = require('./../src/screen/view');
      ScreenState = require('./../src/screen/state');
    }, function() {done();});
  });

  describe('instance', function () {
    var instance, standaloneScreen;

    function makeInstance(viewSetup, modelSetup, clear) {
      return function() {
        if (clear) {
          if (instance && typeof instance.remove === 'function') instance.remove();
          holder.innerHTML = '';
        }

        viewSetup = viewSetup || {};
        viewSetup.model = viewSetup.model || (new ScreenState(modelSetup || {
          layers: [],
          signals: []
        }));

        instance = new ControllerView(viewSetup);
        instance.el.style.minHeight = 'calc(45vh - 40px)';
        holder.appendChild(instance.el);

        standaloneScreen = new ScreenView({model: new ScreenState(viewSetup.model.toJSON())});
        holder.appendChild(standaloneScreen.el);

        // instance.on('all', window.logEvents('controllerView'));
        // instance.model.on('all', window.logEvents('controllerView.model'));
        // standaloneScreen.on('all', window.logEvents('standaloneScreenView'));
        // standaloneScreen.model.on('all', window.logEvents('standaloneScreenView.model'));
      };
    }

    before(makeInstance({}, {
      layers: [
        {
          active: true,
          name: 'Layer 1'
        },
        {
          active: true,
          name: 'Layer 2'
        }
      ],
      signals: [
        {
          type: 'beat',
          name: 'beat:a',
          input: 120
        }
      ]
    }));

    describe('methods', function() {
      describe('update', function() {
        this.slow(1000 / 16);
        this.timeout(1000 / 4);

        it('updates the screenView', function(done) {
          this.retries(3);

          var called = 0;
          var latency;
          var screenUpdate = standaloneScreen.update;
          standaloneScreen.update = function(data) {
            latency = data.latency;
            called++;
            screenUpdate.call(standaloneScreen, data);
          };

          var layers = instance.model.layers;
          layers.remove(layers.at(0));

          expect(layers.length).to.be(1);

          standaloneScreen.on('change:layers', function() {
            expect(called).to.be(1);
            expect(latency).to.be.below(15);
            expect(standaloneScreen.model.layers.length).to.be(1);
            expect(standaloneScreen.queryAll('.missing-layer-view')).to.have.length(1);
            done();
          });

          instance.update({frametime: performance.now()});
        });
      });
    });

    describe('values', function() {
      describe('screenView', function() {
        before(makeInstance({}, {
          layers: [
            {
              active: true,
              name: 'Layer 1'
            },
            {
              active: true,
              name: 'Layer 2'
            }
          ],
          signals: [
            {
              type: 'beat',
              name: 'beat:a',
              input: 120
            }
          ]
        }));


        it('is a rendered ScreenView', function() {
          window.controller = instance;
          expect(instance.screenView).to.be.ok();
          expect(instance.screenView.el).to.be.ok();
          expect(instance.el.contains(instance.screenView.el)).to.be(true);
        });

        it('adds layer elements to the screen', function() {
          expect(instance.screenView.queryAll('.missing-layer-view')).to.have.length(2);
          expect(standaloneScreen.queryAll('.missing-layer-view')).to.have.length(2);
        });

        it('does not share the model with its screen view', function () {
          expect(instance.model === instance.screenView.model).not.to.be.ok();
        });
      });
    });
  });
});