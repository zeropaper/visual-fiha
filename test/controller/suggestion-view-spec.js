describe('Suggestion View', function () {
  'use strict';
  function warn(e) {console.warn(e);}
  var expect = require('expect.js');
  var testUtils = require('./../test-utils');
  var View = require('ampersand-view');
  var SuggestionView = require('./../../src/controller/suggestion-view');
  var holder;
  var fullList = [
    'varA',
    'varAsub1',
    'varAsub1first',
    'varAsub1second',
    'varAsub2',
    'varB',
    'xxx'
  ];

  before(function () {
    holder = testUtils.makeHolder('suggestion-view');
  });

  describe('instance', function () {
    var instance, holderView, inputA, inputB;
    var HolderView;

    function makeInstance(clear) {
      return function() {
        HolderView = View.extend({
          autoRender: true,
          template: '<div class="holder-view">' +
            '<div class="input-holder"><input placeholder="var-a" name="var-a" /></div>' +
            '<div class="input-holder"><input placeholder="var-b" name="var-b" /></div>' +
          '</div>',
          props: {
            varA: 'string',
            varB: 'string'
          },
          bindings: {
            varA: {selector: '[name="var-a"]', type: 'value'},
            varB: {selector: '[name="var-b"]', type: 'value'}
          }
        });

        if (clear) {
          if (instance && typeof instance.remove === 'function') instance.remove();
          holder.innerHTML = '';
        }

        if (holderView) {
          holderView.remove();
        }

        holderView = new HolderView({
          varA: '',
          varB: ''
        });

        inputA = holderView.query('[name="var-a"]');
        inputB = holderView.query('[name="var-b"]');

        holder.appendChild(holderView.el);

        instance = new SuggestionView({
          parent: holderView
        });
      };
    }

    before(makeInstance());

    describe('methods', function() {
      function selectionCallback(selected) {
        // console.info('selected', selected);
      }

      describe('attach', function() {
        it('is used to bind the view to an input element', function() {
          expect(function() {
            instance.attach(inputA, selectionCallback);
          }).not.to.throwException(warn);
        });
      });

      describe('fill', function() {
        it('is used to pass unfiltered suggestions', function() {
          expect(function() {
            instance.fill(fullList);
            // console.info('filled', instance);
          }).not.to.throwException(warn);
        });
      });

      describe('detach', function() {
        it('is meant properly unbind the view from the input');
      });
    });
  });
});