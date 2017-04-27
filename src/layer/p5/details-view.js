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

      <div class="rows row param-section">
        <h5>CSS variables</h5>
        <div class="row columns">
          <div class="columns"><input type="text" name="style-prop-name" placeholder="--css-var-name" /></div>
          <div class="columns"><input type="text" name="style-prop-default" placeholder="2px, 100%, " /></div>
          <div class="columns no-grow"><button name="style-prop-add" class="vfi-plus"></button></div>
        </div>
        <div class="row style-props" ></div>
      </div>

      <div class="rows row param-section">
        <h5>Layer properties</h5>
        <div class="row mappings props"></div>
      </div>
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