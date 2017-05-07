'use strict';
var assign = require('lodash.assign');
var DetailsView = require('./../controller/details-view');

var LayerDetailsView = DetailsView.extend({
  template: `
    <section>
      <header>
        <div class="columns">
          <h3 class="column">Details for <span data-hook="name"></span> <small data-hook="type"></small></h3>
          <div class="column no-grow columns">
            <div class="column no-grow"><button class="vfi-eye" name="show-origin"></button></div>
          </div>
        </div>
        <h5 data-hook="object-path"></h5>
      </header>

      <div class="content"></div>
    </section>
  `,

  events: assign(DetailsView.prototype.events, {
    'click [name=show-origin]': '_showOrigin'
  }),


  _showOrigin: function() {
    this.rootView.trigger('blink', this.modelPath);
  }
});

LayerDetailsView.types = {};

module.exports = LayerDetailsView;