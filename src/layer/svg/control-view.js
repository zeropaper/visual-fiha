'use strict';

var ScreenLayerControlView = require('./../control-view');
module.exports = ScreenLayerControlView.types.SVG = ScreenLayerControlView.extend({
  template: '<section class="default-layer-control">' +
    '<header class="columns">' +
      '<div class="column no-grow gutter-right"><button class="active prop-toggle"></button></div>' +
      '<div class="column no-grow gutter-horizontal"><button class="edit-draw-function vfi-cog-alt"></button></div>' +
      '<h3 class="column layer-name gutter-left" data-hook="name"></h3>' +
    '</header>' +

    '<div class="preview gutter-horizontal"></div>' +

    '<div class="mappings props"></div>' +
  '</section>',

  _editSVGStyles: function () {
    throw new Error('_editSVGStyles not implemented');
    // var editor = this.codeEditor;
    // if (!editor.changed) {
    //   editor.edit({
    //     script: this.model.drawFunction,
    //     language: 'javascript',
    //     onvalidchange: function () {}
    //   });
    // }
    // else {
    //   // console..warn('A function is already being edited');
    // }
  }
});