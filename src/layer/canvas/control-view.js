'use strict';
var assign = require('lodash.assign');
var LayerControlView = require('./../control-view');
var CanvasDetailsView = require('./details-view');
var reference = require('./reference');
var snippets = require('./snippets');

module.exports = LayerControlView.types.canvas = LayerControlView.extend({
  template: `
    <section class="row canvas-control">
      <header class="columns">
        <div class="column no-grow"><button class="active prop-toggle"></button></div>
        <div class="column no-grow"><button class="edit-css vfi-code"></button></div>
        <h5 class="column no-grow layer-type"><span data-hook="type"></span></h5>
        <h3 class="column layer-name" data-hook="name"></h3>
        <div class="column columns no-grow">
          <div class="column no-grow text-right"><button name="edit-update-function">update</button></div>
          <div class="column no-grow text-right"><button class="vfi-trash-empty remove-layer"></button></div>
        </div>
      </header>
    </section>
  `,

  events: assign(LayerControlView.prototype.events, {
    'click [name=edit-update-function]': '_editUpdateFunction'
  }),

  _editUpdateFunction: function() {
    this.editFunction('updateFunction', {
      reference: reference,
      snippets: snippets
    });
  },

  _showDetails: function () {
    this.rootView.showDetails(new CanvasDetailsView({
      parent: this,
      model: this.model
    }));
  }
});