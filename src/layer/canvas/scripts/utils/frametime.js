'use strict';
/*global module */
module.exports = function frametime(ctx) {
  var cx = ctx.canvas.width * 0.5;
  var cy = ctx.canvas.height * 0.5;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = (cy * 0.25) + 'px monospace';
  var ft = Math.round(this.screenState.frametime) + 'ms';
  ctx.fillStyle = '#000';
  ctx.strokeStyle = '#fff';
  ctx.fillText(ft, cx, cy);
  ctx.strokeText(ft, cx, cy);
};