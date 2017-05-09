'use strict';
var LayerControlView = require('./../control-view');
var P5DetailsView = require('./details-view');
var assign = require('lodash.assign');

var P5LayerControlView = LayerControlView.types.p5 = LayerControlView.extend({
  template: `
    <section class="default-layer-control">
      <header class="columns">
        <div class="column no-grow"><button class="active prop-toggle"></button></div>
        <div class="column no-grow"><button class="edit-css vfi-code"></button></div>
        <h5 class="column no-grow layer-type"><span data-hook="type"></span></h5>
        <h3 class="column layer-name gutter-horizontal" data-hook="name"></h3>
        <div class="column columns no-grow">
          <div class="column no-grow text-right"><button name="edit-setup-function">Setup</button></div>
          <div class="column no-grow text-right"><button name="edit-draw-function">Update</button></div>
          <div class="column no-grow text-right"><button class="vfi-trash-empty remove-layer"></button></div>
        </div>
      </header>

      <div class="preview gutter-horizontal"></div>

      <div class="mappings props"></div>
    </section>
  `,

  events: assign(LayerControlView.prototype.events, {
    'click [name=edit-setup-function]': '_editSetupFunction',
    'click [name=edit-draw-function]': '_editDrawFunction'
  }),

  _editSetupFunction: function() {
    this.editFunction('setupFunction', {
      importantNote: 'Do not forget to call <code>ready()</code>'
    });
  },
  _editDrawFunction: function() {
    this.editFunction('drawFunction');
  },

  _showDetails: function () {
    this.rootView.showDetails(new P5DetailsView({
      parent: this,
      model: this.model
    }));
  }
});
module.exports = P5LayerControlView;