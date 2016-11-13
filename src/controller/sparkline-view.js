'use strict';
module.exports = VFDeps.View.extend({
  autoRender: true,
  template: '<canvas width="120" height="29"></canvas>',
  session: {
    data: ['array', true, function() {
      return [];
    }],
    lineWidth: ['number', true, 1],
    width: ['number', true, 120],
    height: ['number', true, 29],
    padding: ['number', true, 2],
    color: ['string', true, '#000'],
    font: ['string', true, '11px sans']
  },
  bindings: {
    width: {
      type: 'attribute',
      name: 'width'
    },
    height: {
      type: 'attribute',
      name: 'height'
    // },
    // data: {
    //   type: function() {
    //     this.update();
    //   }
    }
  },
  derived: {
    ctx: {
      deps: ['el', 'width', 'height'],
      fn: function() {
        return this.el.getContext('2d');
      }
    },
    innerW: {
      deps: ['el', 'width'],
      fn: function() {
        return this.el.width - (2 * this.lineWidth);
      }
    },
    innerH: {
      deps: ['el', 'height'],
      fn: function() {
        return this.el.height - (2 * this.lineWidth);
      }
    }
  },
  max: function() {
    var val = 0;
    if (!this.data.length) { return val; }
    this.data.forEach(function(d) {
      val = Math.max(d, val);
    });
    return val;
  },
  min: function() {
    var val = this.max();
    if (!this.data.length) { return val; }
    this.data.forEach(function(d) {
      val = Math.min(d, val);
    });
    return val;
  },
  avg: function() {
    var tt = 0;
    if (!this.data.length) { return tt; }
    this.data.forEach(function(v) {
      tt += v;
    });
    return tt / (this.data.length);
  },

  update: function(newVal) {
    if (!this.el) {
      return this;
    }
    var lineWidth = this.lineWidth;
    var ctx = this.ctx;
    var avg = this.avg();
    var max = this.max();

    var padding = 2 * lineWidth;
    var innerW = this.innerW;
    var innerH = this.innerH;
    var maxLength = Math.round(innerW / 2);

    if (typeof newVal !== 'undefined') {
      this.data.unshift(newVal);
      if (this.data.length > maxLength) {
        this.data = this.data.slice(0, -1);
      }
    }
    var step = innerW / (this.data.length - 1);

    function toPx(val) {
      return ((innerH / max) * val) + padding;
    }

    ctx.clearRect(0, 0, this.width, this.height);

    ctx.font = this.font;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.color;
    ctx.moveTo(innerW + padding, toPx(this.data[0]));
    ctx.beginPath();

    this.data.forEach(function(d, i) {
      var right = (innerW - (step * i)) + padding;
      var top = toPx(d);
      ctx.lineTo(right, top);
    });

    var current = this.data[0] || 0;
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(innerW + padding, toPx(current), lineWidth * 2, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(padding, toPx(avg));
    ctx.lineTo(padding + innerW, toPx(avg));
    ctx.stroke();

    current = Math.round(avg * 100) / 100;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.clearRect(0, padding, ctx.measureText(current).width + (padding * 2), ctx.canvas.height - padding);
    ctx.fillText(current, padding, ctx.canvas.height * 0.5);
    return this;
  }
});
