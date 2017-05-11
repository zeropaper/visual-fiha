'use strict';

var assign = require('lodash.assign');
var LayerDetailsView = require('./../details-view');
var reference = require('./reference');
var snippets = require('./snippets');

var CanvasLayerDetailsView = LayerDetailsView.extend({
  template: `
    <section>
      <header>
        <div class="columns">
          <h3 class="column">Details for <span data-hook="name"></span> <small data-hook="type"></small></h3>
          <div class="column no-grow columns">
            <div class="column no-grow"><button class="yes" title="Edit update function" name="edit-update-function">Update</button></div>
            <div class="column no-grow"><button class="vfi-eye" name="show-origin"></button></div>
          </div>
        </div>
        <h5 data-hook="object-path"></h5>
      </header>

      <div class="content"></div>
    </section>
  `,

  events: assign(LayerDetailsView.prototype.events, {
    'click [name=edit-update-function]': '_editUpdateFunction'
  }),

  _editUpdateFunction: function() {
    this.editFunction('updateFunction', {
      reference: reference,
      snippets: snippets
    });
  }
});

module.exports = CanvasLayerDetailsView;