'use strict';
var View = window.VFDeps.View;

var LayerView = View.extend({
  template: function() {
    return '<div class="missing-layer-view" style="will-change:transform, opacity, backfaceVisibility;width:100%;height:100%;display:table">'+
              '<div style="display:table-cell;color:#a66;vertical-align:middle;text-align:center;font-weight:700;font-size:30px;text-shadow:0 0 4px #000">' +
                'Missing ' +
                '<span data-hook="type"></span> for ' +
                '<span data-hook="name"></span> ' +
                'layer view' +
                '<br/>' +
                '<span data-hook="frametime"></span> ' +
              '</div>'+
            '</div>';
  },

  derived: {
    style: {
      deps: [
        'width',
        'height',
        'model.opacity',
        'model.skewX',
        'model.skewY',
        'model.rotateX',
        'model.rotateY',
        'model.rotateZ',
        'model.translateX',
        'model.translateY',
        // 'model.translateZ',
        'model.scaleX',
        'model.scaleY',
        // 'model.scaleZ',
        'model.originX',
        'model.originY',
        'model.backfaceVisibility'
      ],
      fn: function() {
        return {
          opacity: this.model.opacity,
          width: this.width + 'px',
          height: this.height + 'px',
          transform:
                    'rotateX(' + this.model.rotateX + 'deg) ' +
                    'rotateY(' + this.model.rotateY + 'deg) ' +
                    'rotateZ(' + this.model.rotateZ + 'deg) ' +
                    'translateX(' + this.model.translateX + '%) ' +
                    'translateY(' + this.model.translateY + '%) ' +
                    // 'translateZ(' + this.model.translateZ + '%) ' +
                    'scaleX(' + this.model.scaleX + ') ' +
                    'scaleY(' + this.model.scaleY + ') ' +
                    // 'scaleZ(' + this.model.scaleZ + '%) ' +
                    'skewX(' + this.model.skewX + 'deg) ' +
                    'skewY(' + this.model.skewY + 'deg) ' +
                    'perspective(' + this.model.perspective + ')' +
                    ''
        };
      }
    }
  },

  session: {
    width: ['number', true, 400],
    height: ['number', true, 300]
  },

  bindings: {
    'model.active': {
      type: 'toggle'
    },
    'model.type': '[data-hook=type]',
    'model.name': '[data-hook=name]',
    style: {
      type: function() {
        var computed = this.style;
        var style = this.el.style;
        Object.keys(computed).forEach(function(key) {
          style[key] = computed[key];
        });
      }
    }
  },

  update: function() {}
});

module.exports = LayerView;