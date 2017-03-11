'use strict';
var View = require('ampersand-view');

var LayerView = View.extend({
  template: function() {
    return `
      <div layer-id="${this.model.getId()}" view-id="${this.cid}" class="missing-layer-view" style="will-change:transform, opacity, backfaceVisibility;width:100%;height:100%;display:table">
        <div style="display:table-cell;color:#a66;vertical-align:middle;text-align:center;font-weight:700;font-size:30px;text-shadow:0 0 4px #000">
          Missing
          <span data-hook="type"></span> for
          <span data-hook="name"></span>
          layer view
          <br/>
          <span data-hook="frametime"></span>
        </div>
      </div>
    `;
  },

  derived: {
    styleEl: {
      deps: ['el'],
      fn: function() {
        var el = document.getElementById('style-' + this.cid);
        if (!el) {
          el = document.createElement('style');
          el.id = 'style-' + this.cid;
          el.appendChild(document.createTextNode(''));
          document.head.appendChild(el);
        }
        return el;
      }
    },
    sheet: {
      deps: ['styleEl'],
      fn: function() {
        return this.styleEl.sheet;
      }
    },
    cssRule: {
      deps: ['sheet'],
      fn: function() {
        if (this.sheet.cssRules.length === 0) {
          this.addRule('', 'opacity: 1');
        }
        return this.sheet.cssRules[0];
      }
    }
  },

  session: {
    width: ['number', true, 400],
    height: ['number', true, 300]
  },

  bindings: {
    'model.type': '[data-hook=type]',
    'model.name': '[data-hook=name]',
    'model.active': {
      type: function(el, val) {
        this.cssRule.style.display = val ? 'block' : 'none';
      }
    },
    'model.opacity': {
      type: function(el, val) {
        this.cssRule.style.opacity = val * 0.01;
      }
    },
    'model.zIndex': {
      type: function(el, val) {
        this.cssRule.style.zIndex = val;
      }
    }
  },

  setProperty: function(...args) {
    // console.info('set CSS  %s: %s on "%s" (%s)', ...args, this.model.getId(), this.model.getType());
    this.cssRule.style.setProperty(...args);
  },

  addRule: function(selector, properties) {
    var sheet = this.sheet;
    var prefix = '[layer-id="'+ this.model.getId() +'"] ';
    var index = sheet.cssRules.length;
    selector = selector.indexOf('@') === 0 ? selector : prefix + selector;
    for (var i = index - 1; i >= 0; i--) {
      if (sheet.cssRules[i].selectorText === selector) {
        sheet.deleteRule(i);
      }
    }


    index = sheet.cssRules.length;

    if('insertRule' in sheet) {
      sheet.insertRule(selector + ' { ' + properties + ' } ', index);
    }
    else if('addRule' in sheet) {
      sheet.addRule(selector, properties, index);
    }
    return this;
  },

  remove: function() {
    var styleEl = this.styleEl;
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl);
    }
    return View.prototype.remove.apply(this, arguments);
  },

  update: function() {}
});
LayerView.types = {};
module.exports = LayerView;