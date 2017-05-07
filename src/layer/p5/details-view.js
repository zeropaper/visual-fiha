'use strict';
var assign = require('lodash.assign');
var DetailsView = require('./../details-view');

module.exports = DetailsView.types.p5 = DetailsView.extend({
  template: `
    <section>
      <header>
        <div class="columns">
          <h3 class="column">Details for <span data-hook="name"></span> <small data-hook="type"></small></h3>
          <div class="column no-grow columns">
            <div class="column no-grow"><button class="yes" title="Edit setup function" name="edit-setup-function">setup</button></div>
            <div class="column no-grow"><button class="yes" title="Edit draw function" name="edit-draw-function">draw</button></div>
            <div class="column no-grow"><button class="vfi-eye" name="show-origin"></button></div>
          </div>
        </div>
        <h5 data-hook="object-path"></h5>
      </header>

      <div class="content"></div>
    </section>
  `,

  events: assign(DetailsView.prototype.events, {
    'click [name=edit-setup-function]': '_editSetupFunction',
    'click [name=edit-draw-function]': '_editDrawFunction'
  }),

  _editSetupFunction: function() {
    this.editFunction('setupFunction');
  },

  _editDrawFunction: function() {
    this.editFunction('drawFunction');
  }
});