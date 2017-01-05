'use strict';
/* global describe, require, R, it, before, expect, VFDeps */
function warn(e) {console.warn(e);}
describe('Suggestion View', function () {
  var holder, SuggestionView, View = VFDeps.View;
  var fullList = [
    'varA',
    'varAsub1',
    'varAsub1first',
    'varAsub1second',
    'varAsub2',
    'varB',
    'xxx'
  ];

  before(function (done) {
    if (typeof R === 'undefined') {
      this.skip();
      return done();
    }

    holder = document.createElement('div');
    holder.className = 'suggestion-view-test-holder';
    document.getElementById('holder').appendChild(holder);
    R(function (require) {
      SuggestionView = require('./../src/controller/suggestion-view');
    }, function() {done();});
  });

  describe('instance', function () {
    var instance, holderView, inputA, inputB;
    var HolderView = View.extend({
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

    function makeInstance(clear) {
      return function() {
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
        console.info('selected', selected);
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
            console.info('filled', instance);
          }).not.to.throwException(warn);
        });
      });

      describe('detach', function() {
        it('is meant properly unbind the view from the input');
      });
    });
  });
});