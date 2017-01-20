describe('Mapping Control View', function () {
  'use strict';
  function warn(e) {console.warn(e);}
  var expect = require('expect.js');
  var testUtils = require('./../test-utils');
  var View = require('ampersand-view');
  var State = require('ampersand-state');
  var ControlView = require('./../../src/mapping/control-view');

  var holder = document.getElementById('holder') || document.body;
  var HolderView = View.extend({
    autoRender: true,
    template: '<div><div><div class="region"></div></div></div>'
  });
  var SubViewState = State.extend({
    session: {
      counter: ['number', true, 0]
    }
  });
  var SubView = View.extend({
    autoRender: true,
    template: '<div class="subview"><button></button><span></span></div>',
    session: {
      num: ['number', true, 0]
    },
    bindings: {
      num: {selector: 'button', type: 'text'},
      'model.counter': {selector: 'span', type: 'text'}
    },
    events: {
      'click button': 'clickButton'
    },
    clickButton: function() {
      console.info('click button', this.model.counter);
      this.model.counter++;
    }
  });

  var holderView, instance;
  function eachSetup() {
    holder = testUtils.makeHolder('mapping-control-view');
  }

  function eachTearDown() {
    // if (holderView) {
    //   holderView.remove();
    // }
  }



  describe('rendering', function() {
    beforeEach(eachSetup);

    afterEach(eachTearDown);

    it('displays a list of mapping information');
  });



  describe('add form', function() {
    beforeEach(eachSetup);

    afterEach(eachTearDown);

    it('allows to create new mapping');
  });



  describe('remove button', function() {
    beforeEach(eachSetup);

    afterEach(eachTearDown);

    it('allows to create new mapping');
  });
});