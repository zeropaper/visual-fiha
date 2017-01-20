describe('Region View', function () {
  'use strict';
  function warn(e) {console.warn(e);}
  var expect = require('expect.js');
  var testUtils = require('./../test-utils');
  var View = require('ampersand-view');
  var State = require('ampersand-state');
  var RegionView = require('./../../src/controller/region-view');

  var holder, holderView, instance;

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
      this.model.counter++;
    }
  });


  var model1 = new SubViewState();
  var model2 = new SubViewState();
  var model3 = new SubViewState();

  function eachSetup() {
    if (holderView) {
      holderView.remove();
    }

    holder = testUtils.makeHolder('region-view');

    holderView = new HolderView({});
    holder.appendChild(holderView.el);

    function rebuild1() {
      return new SubView({
        num: 1,
        model: model1,
        parent: holderView
      });
    }

    function rebuild2() {
      return new SubView({
        num: 2,
        model: model2,
        parent: holderView
      });
    }

    function rebuild3() {
      return new SubView({
        num: 3,
        model: model3,
        parent: holderView
      });
    }

    var subView1 = new SubView({num: 1, model: model1, parent: holderView});
    var subView2 = new SubView({num: 2, model: model2, parent: holderView});
    var subView3 = new SubView({num: 3, model: model3, parent: holderView});

    instance = new RegionView({
      parent: holderView,
      el: holderView.query('.region'),
      tabs: [
        {name: 'Sub View 1', rebuild: rebuild1/*, view: subView1*/, pinned: true, active: true},
        {name: 'Sub View 2', rebuild: rebuild2/*, view: subView2*/, pinned: true},
        {name: 'Sub View 3', rebuild: rebuild3/*, view: subView3*/}
      ]
    });
  }

  function eachTearDown() {
    // if (holderView) {
    //   holderView.remove();
    // }
  }


  function clickTab(num) {
    testUtils.doclick(instance.query('.region-tabs li:nth-child(' + num + ') .name'));
  }

  function clickSubViewButton() {
    testUtils.doclick(instance.query('.region-content .subview > button'));
  }

  function getButtonText() {
    return instance.query('.region-content .subview > button').textContent;
  }

  function getCounter() {
    return instance.query('.region-content .subview > span').textContent;
  }




  describe('switching between views', function() {
    beforeEach(eachSetup);

    afterEach(eachTearDown);

    it('displays a serie of tabs', function() {
      expect(instance.queryAll('.region-tabs li').length).to.be(3);
    });

    it('shows the view when its tab is clicked', function() {
      expect(clickTab).withArgs(2).not.to.throwException(warn);
      expect(getButtonText()).to.be('2');

      expect(clickTab).withArgs(3).not.to.throwException(warn);
      expect(getButtonText()).to.be('3');

      expect(clickTab).withArgs(1).not.to.throwException(warn);
      expect(getButtonText()).to.be('1');
    });

    it('handles subview bindings and events correctly', function() {
      expect(clickTab).withArgs(2).not.to.throwException(warn);
      // debugger;
      expect(getButtonText()).to.be('2');

      // var keys = Object.keys;
      // var tabs = instance.tabs.map(function(model) {
      //   return model.view;
      // });
      // function _data(view, v) {
      //   if (!view) { return {}; }
      //   var events = view._events || {all:[], 'change:el': []};
      //   return {
      //     active: instance.tabs.at(v).active,
      //     counter: view.model.counter,
      //     cid: view.cid,
      //     statecid: view.model.cid,
      //     listeningTo: keys(view._lisentingTo || {}),
      //     bindings: keys(view._bindings || {}).length,
      //     _events: keys(events || {}).length,
      //     all: (events.all || []).length,
      //     'change:el': (events['change:el'] || []).length
      //   };
      // }
      // console.table(tabs.map(_data));
      //   return obj.callback;
      // }).join(', '));

      expect(getCounter()).to.be('0');
      clickSubViewButton();
      expect(getCounter()).to.be('1');
      clickSubViewButton();
      expect(getCounter()).to.be('2');

      expect(clickTab).withArgs(3).not.to.throwException(warn);
      expect(getButtonText()).to.be('3');

      // console.table(tabs.map(_data));

      expect(getCounter()).to.be('0');
      clickSubViewButton();
      expect(getCounter()).to.be('1');

      // console.table(tabs.map(_data));

      expect(clickTab).withArgs(2).not.to.throwException(warn);
      expect(getButtonText()).to.be('2');

      // console.table(tabs.map(_data));
      //   return obj.callback;
      // }).join(', '));

      expect(getCounter()).to.be('2');
      clickSubViewButton();
      expect(getCounter()).to.be('3');

      expect(clickTab).withArgs(3).not.to.throwException(warn);
      expect(getButtonText()).to.be('3');

      // console.table(tabs.map(_data));
      //   return obj.callback;
      // }).join(', '));

      expect(getCounter()).to.be('1');
      clickSubViewButton();
      clickSubViewButton();
      expect(getCounter()).to.be('3');
    });
  });



  describe('closeable tab', function() {
    beforeEach(eachSetup);

    afterEach(eachTearDown);

    it('has a close button', function() {
      expect(instance.query('.region-tabs li:nth-child(3) button')).to.be.ok();
    });

    it('closes the tabe when the button is clicked', function() {
      testUtils.doclick(instance.query('.region-tabs li:nth-child(3) button'));
      expect(instance.queryAll('.region-tabs li').length).to.be(2);
    });
  });
});