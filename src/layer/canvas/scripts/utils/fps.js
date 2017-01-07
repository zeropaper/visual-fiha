'use strict';
/*global module */
module.exports = function fps(ctx) {
  var cx = ctx.canvas.width * 0.5;
  var cy = ctx.canvas.height * 0.5;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = (cy * 0.25) + 'px monospace';

  var cache = this.cache;
  var screen = this.screenState;

  cache.previous = cache.previous || 0;
  var fps = Math.round(1000 / (screen.frametime - cache.previous)) + 'fps';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#000';
  ctx.strokeStyle = '#fff';
  ctx.fillText(fps, cx, cy);
  ctx.strokeText(fps, cx, cy);
  cache.previous = screen.frametime;
};