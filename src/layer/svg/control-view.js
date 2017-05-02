'use strict';
var assign = require('lodash.assign');
var ScreenLayerControlView = require('./../control-view');
var SVGDetailsView = require('./details-view');

module.exports = ScreenLayerControlView.types.SVG = ScreenLayerControlView.extend({
  template: `
    <section class="svg-layer-control">
      <header class="columns">
        <div class="column no-grow"><button class="active prop-toggle"></button></div>
        <div class="column no-grow"><button title="Edit layer CSS" class="edit-css vfi-code"></button></div>
        <h5 class="column no-grow layer-type"><span data-hook="type"></span></h5>
        <h3 class="column layer-name gutter-horizontal" data-hook="name"></h3>
        <div class="column columns no-grow">
          <div class="column no-grow text-right"><button name="edit-svg-css">CSS</button></div>
          <div class="column no-grow text-right"><button class="vfi-trash-empty remove-layer"></button></div>
        </div>
      </header>

      <div class="preview gutter-horizontal"></div>

      <div class="mappings props"></div>
    </section>
  `,

  events: assign(ScreenLayerControlView.prototype.events, {
    'click [name=edit-svg-css]': '_editSvgStyles'
  }),

  session: {
    svgStyles: ['object', true, function() { return {}; }]
  },

  _editSvgStyles: SVGDetailsView.prototype._editSvgStyles,

  _showDetails: function () {
    this.rootView.showDetails(new SVGDetailsView({
      parent: this,
      model: this.model
    }));
  }
});