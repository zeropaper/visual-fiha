'use strict';
/* global module */
module.exports = function roundFrequencies(ctx) {
  var audio = this.screenState.audio || {};
  var bufferLength = audio.bufferLength;
  var freqArray = audio.frequency;
  var timeDomainArray = audio.timeDomain;

  if (!bufferLength || !freqArray || !timeDomainArray) return;

  var x = ctx.canvas.width * 0.5;
  var y = ctx.canvas.height * 0.5;
  var r = Math.min(x, y) - 20;
  // var first;
  var rad = Math.PI * 2;

  var i = 0, a, td, lx, ly;
  var original = {
    lineWidth: ctx.lineWidth,
    lineCap: ctx.lineCap,
    lineJoin: ctx.lineJoin,
    strokeStyle: ctx.strokeStyle,
  };

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.strokeStyle = 'red';
  var col;
  for (var lw = y*2; lw >= y*0.2; lw-=y*0.2) {
    col = col === 'white' ? 'black' : 'white';
    ctx.strokeStyle = col;
    ctx.lineWidth = lw;

    // ctx.beginPath();
    // for (i = 0; i < bufferLength; i++) {
    //   a = ((rad / bufferLength) * i) - Math.PI;
    //   f = (r / 100) * (freqArray[i] / 2);
    //   lx = Math.round(x + Math.cos(a) * f);
    //   ly = Math.round(y + Math.sin(a) * f);
    //   ctx.lineTo(lx, ly);
    // }
    // ctx.stroke();

    ctx.beginPath();
    for (i = 0; i < bufferLength; i++) {
      a = ((rad / bufferLength) * i) - Math.PI;
      td = (r / 100) * (timeDomainArray[i] / 2);
      lx = Math.round(x + Math.cos(a) * td);
      ly = Math.round(y + Math.sin(a) * td);
      ctx.lineTo(lx, ly);
    }
    ctx.stroke();
  }

  ctx.lineWidth = original.lineWidth;
  ctx.lineCap = original.lineCap;
  ctx.lineJoin = original.lineJoin;
  ctx.strokeStyle = original.strokeStyle;
};
