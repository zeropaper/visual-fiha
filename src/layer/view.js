'use strict';
var View = require('ampersand-view');

var LayerView = View.extend({
  template: function() {
    return `
      <div layer-id="${this.model.cid}" view-id="${this.cid}" class="missing-layer-view" style="will-change:transform, opacity, backfaceVisibility;width:100%;height:100%;display:table">
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
    style: {
      deps: [
        'model.active',
        'model.opacity',
        'model.mixBlendMode',
        'model.zIndex'
      ],
      fn: function() {
        var width = this.el.parentNode ? (this.el.parentNode.clientWidth + 'px') : '100%';
        var height = this.el.parentNode ? (this.el.parentNode.clientHeight + 'px') : '100%';
        return {
          display: this.model.active ? 'block' : 'none',
          opacity: this.model.opacity * 0.01,
          mixBlendMode: this.model.mixBlendMode,
          width: width,
          height: height,
          zIndex: this.zIndex || 0
        };
      }
    },
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
          this.addRule('', 'display: none');
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
    style: {
      type: function() {
        var style = this.cssRule.style;
        var computed = this.style;
        Object.keys(computed).forEach(function(key) {
          style[key] = computed[key];
        });
      }
    }
  },

  setProperty: function(...args) {
    // console.info('set CSS  %s: %s on "%s" (%s)', ...args, this.model.getId(), this.model.getType());
    this.cssRule.style.setProperty(...args);
  },

  addRule: function(selector, properties) {
    var sheet = this.sheet;
    var prefix = '[view-id="'+ this.cid +'"] ';
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