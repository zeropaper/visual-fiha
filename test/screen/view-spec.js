'use strict';
function warn(err) {
  if (err) console.warn(err);
}
describe.skip('Screen View', function () {
  var holder, ScreenView, ScreenState;

  before(function (done) {
    if (typeof R === 'undefined') {
      ScreenView = require('./../../src/screen/view');
      ScreenState = require('./../../src/screen/state');
      return done();
    }
    holder = document.createElement('div');
    holder.className = 'screen-test-holder';
    document.getElementById('holder').appendChild(holder);
    R(function (require) {
      ScreenView = require('./../src/screen/view');
      ScreenState = require('./../src/screen/state');
    }, function() {done();});
  });

  describe('instance', function () {
    var instance;
    function makeInstance(viewSetup, modelSetup) {

      return function() {
        // holder.innerHTML = '';

        viewSetup = viewSetup || {};
        viewSetup.model = viewSetup.model || (new ScreenState(modelSetup || {
          layers: [],
          signals: []
        }));

        instance = new ScreenView(viewSetup);

        holder.appendChild(instance.el);
      };
    }
    before(makeInstance());

    describe('options', function () {
      describe('mode', function () {
        describe('screen', function () {
          it('is a property', function () {
            expect(instance.mode).to.be('screen');
          });

          it('does not have a MIDI handler', function () {
            expect(instance.MIDIAccess).not.to.be.ok();
          });
        });

        // describe('control', function () {
        //   before(makeInstance({
        //     layers: [],
        //     signals: [],
        //     mode: 'control'
        //   }));

        //   after(makeInstance());

        //   it('is a property', function () {
        //     expect(instance.mode).to.be('control');
        //   });

        //   it('has a MIDI handler', function () {
        //     expect(instance.MIDIAccess).to.be.ok();
        //   });
        // });
      });
    });

    describe('events', function () {
      describe('change:frametime', function () {

      });
    });

    describe('methods', function() {
      describe('update', function() {
        it('draws a frame', function() {
          expect(instance.trigger.bind(instance)).withArgs('change:frametime', 10).to.not.throwException(warn);
          expect();
        });
      });
    });

    describe('values', function() {
      describe('signalNames', function () {
        it('is an array of signal names', function () {
          expect(instance.signalNames).to.be.an('array');
        });
      });
    });
  });
});