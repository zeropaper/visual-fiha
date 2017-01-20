'use strict';
module.exports = require('ampersand-view').extend({
  autoRender: true,
  template: '<canvas width="200" height="200"></canvas>',

  session: {
    lineWidth: ['number', true, 1],
    width: ['number', true, 200],
    height: ['number', true, 200],
    padding: ['number', true, 2],
    color: ['string', true, '#000']
  },

  bindings: {
    width: {
      type: 'attribute',
      name: 'width'
    },
    height: {
      type: 'attribute',
      name: 'height'
    }
  },

  derived: {
    ctx: {
      deps: ['el', 'width', 'height'],
      fn: function() {
        return this.el.getContext('2d');
      }
    }
  },

  drawScales: function(/*bufferLength*/) {
    var ctx = this.ctx;
    var x = ctx.canvas.width * 0.5;
    var y = ctx.canvas.height * 0.5;
    var r = Math.min(x, y) - 20;
    var rad = (Math.PI * 2);

    ctx.fillStyle = ctx.strokeStyle = this.color;
    var i, a, ax, ay, bx, by, lx, ly, ca, sa;
    ctx.globalAlpha = 0.5;
    for (i = 0; i < 360; i += 15) {
      a = ((rad / 360) * i) - Math.PI;
      ca = Math.cos(a);
      sa = Math.sin(a);
      ax = Math.round(x + (ca * (r / 10)));
      ay = Math.round(y + (sa * (r / 10)));
      bx = Math.round(x + (ca * (r - 5)));
      by = Math.round(y + (sa * (r - 5)));
      lx = Math.round(x + (ca * r));
      ly = Math.round(y + (sa * r));

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);

      ctx.textAlign = 'center';
      if (lx < x) {
        ctx.textAlign = 'right';
      }
      else if (lx > x) {
        ctx.textAlign = 'left';
      }

      ctx.textBaseline = 'middle';
      if (ly < y) {
        ctx.textBaseline = 'bottom';
      }
      else if (ly > y) {
        ctx.textBaseline = 'top';
      }
      ctx.globalAlpha = 1;
      ctx.fillText(i, lx, ly);
      ctx.globalAlpha = 0.5;

      ctx.stroke();
      ctx.closePath();
    }
    ctx.globalAlpha = 1;

    return this;
  },

  update: function() {
    if (!this.el) {
      return this;
    }

    var source = this.parent;

    var ctx = this.ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = ctx.strokeStyle = this.color;

    var analyser = source.parent.audioAnalyser;
    var bufferLength = analyser.frequencyBinCount;
    this.drawScales(bufferLength);

    var freqArray = source.parent.audioFrequencyArray;
    analyser.getByteFrequencyData(freqArray);

    var timeDomainArray = source.parent.audioTimeDomainArray;
    analyser.getByteTimeDomainData(timeDomainArray);

    var x = ctx.canvas.width * 0.5;
    var y = ctx.canvas.height * 0.5;
    var r = Math.min(x, y) - 20;
    var rad = Math.PI * 2;

    var i, a, f, td, lx, ly;
    ctx.strokeStyle = '#A581FF';
    ctx.beginPath();
    for (i = 0; i < bufferLength; i++) {
      a = ((rad / bufferLength) * i) - Math.PI;
      f = (r / 100) * (freqArray[i] / 2);
      lx = Math.round(x + Math.cos(a) * f);
      ly = Math.round(y + Math.sin(a) * f);
      ctx.lineTo(lx, ly);
    }
    ctx.stroke();

    ctx.strokeStyle = '#66D9EF';
    ctx.beginPath();
    for (i = 0; i < bufferLength; i++) {
      a = ((rad / bufferLength) * i) - Math.PI;
      td = (r / 100) * (timeDomainArray[i] / 2);
      lx = Math.round(x + Math.cos(a) * td);
      ly = Math.round(y + Math.sin(a) * td);
      ctx.lineTo(lx, ly);
    }
    ctx.stroke();

    return this;
  }
});
