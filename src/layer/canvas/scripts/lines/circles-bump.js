'use strict';
/* global module */
module.exports = function lineGrid(ctx) {
  var cache = this.cache;
  var cw = ctx.canvas.width / 2;
  var ch = ctx.canvas.height / 2;
  var max = cw > ch ? cw : ch;

  ctx.arc(cw, ch, 10);
};
