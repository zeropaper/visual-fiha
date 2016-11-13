'use strict';
module.exports = VFDeps.View.extend({
  autoRender: true,
  template: '<canvas width="200" height="200"></canvas>',
  session: {
    audioAnalyser: ['any', true, null],
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
    },
    audioAnalyserDataArray: {
      deps: ['audioAnalyser'],
      fn: function () {
        return new window.Uint8Array(this.audioAnalyser.frequencyBinCount);
      }
    }
  },

  drawScales: function(bufferLength) {
    var ctx = this.ctx;
    var x = ctx.canvas.width * 0.5;
    var y = ctx.canvas.height * 0.5;
    var r = Math.min(x, y) - 20;
    var rad = (Math.PI * 2);


    // var samples = Math.round(length / 4)
    // var start = Math.round(length / 4);
    // var end = length - start;

    // var i, a, ax, ay, bx, by, lx, ly, ca, sa;
    // ctx.globalAlpha = 0.5;
    // for (i = start; i < end; i++) {
    //   a = ((rad / half) * (i - start)) - Math.PI;

    var i, a, ax, ay, bx, by, lx, ly, ca, sa;
    ctx.globalAlpha = 0.5;
    for (i = 0; i < bufferLength; i++) {
      a = ((rad / bufferLength) * i) - Math.PI;
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

    var ctx = this.ctx;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = ctx.strokeStyle = this.color;

    var analyser = this.audioAnalyser;
    var bufferLength = analyser.frequencyBinCount;
    this.drawScales(bufferLength);
    ctx.fillStyle = ctx.strokeStyle = this.color;

    var dataArray = this.audioAnalyserDataArray;
    analyser.getByteFrequencyData(dataArray);


    var x = ctx.canvas.width * 0.5;
    var y = ctx.canvas.height * 0.5;
    var r = Math.min(x, y) - 20;
    var rad = (Math.PI * 2);

    var i, a, lx, ly;
    ctx.beginPath();
    for (i = 0; i < bufferLength; i++) {
      a = ((rad / bufferLength) * i) - Math.PI;
      lx = Math.round(x + Math.cos(a) * ((r / 100) * (dataArray[i] / 2)));
      ly = Math.round(y + Math.sin(a) * ((r / 100) * (dataArray[i] / 2)));
      ctx.lineTo(lx, ly);
    }
    ctx.stroke();

    return this;
  }
});
