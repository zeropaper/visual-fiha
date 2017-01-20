describe('Screen View', function () {
  'use strict';
  function warn(e) {console.warn(e);}

  var holder;
  var expect = require('expect.js');
  var ScreenView = require('./../../src/screen/view');
  var ScreenState = require('./../../src/screen/state');

  before(function () {
    if (!holder) {
      holder = document.createElement('div');
      holder.className = 'screen-test-holder';
      (document.getElementById('holder') || document.body).appendChild(holder);
    }
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
  });
});