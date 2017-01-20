'use strict';
/* global module */
module.exports = function lineGrid(ctx) {
  ctx.strokeStyle = this.lineColor || '#000';
  ctx.fillStyle = this.lineColor || '#000';
  var rows = Math.max(this.pointRows || 4, 1);
  var lw = this.lineWidth || 0;
  var radius = Math.max(this.pointRadius || lw, 1);
  var vol = this.screenState.audio.timeDomain;
  var freq = this.screenState.audio.frequency;
  var count = vol.length;//Math.max(this.pointsCount || 1, 1);
  var twoPI = Math.PI * 2;
  var w = ctx.canvas.width;
  var h = ctx.canvas.height;
  var sh = h / rows;
  var cols = Math.round(count / rows);
  var sw = w / cols;
  var row = -0.5;
  var prow;
  // var rand = this.randFactor || 0;
  var i;
  var x;
  var y;
  var px;
  var py;
  var p;
  var point;
  var points = [];


  // function random(factor) {
  //   factor = factor || rand;
  //   return Math.random() * rand * (Math.random() > 0.5 ? 1 : -1);
  // }

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = lw;
  for (i = 0; i < count; i++) {
    if (i % cols < 1) {
      row++;
    }
    y = (sh * row) + (freq[i] - 12);// + random(freq[i]);
    x = (sw * 0.5) + (sw * (i % cols));// + (freq[i] - 12);// + random(freq[i]);
    points.push([x, y]);

    if (lw) {
      if (!px) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
      else {
        if (row != prow) {
          ctx.stroke();
          ctx.moveTo(x, y);
        }
        else {
          ctx.lineTo(x, y);
        }
      }
    }

    px = x;
    py = y;
    prow = row;
  }
  ctx.stroke();
  ctx.closePath();

  for (p in points) {
    point = points[p];
    ctx.beginPath();
    ctx.arc(point[0], point[1], Math.min(Math.max(vol[p] * radius * 0.01, 1), sh * 0.5), 0, twoPI);
    ctx.closePath();
    ctx.fill();
  }
};
