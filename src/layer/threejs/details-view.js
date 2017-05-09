'use strict';
var LayerDetailsView = require('./../details-view');
var assign = require('lodash.assign');
// var propNamesExtractor = require('./../../utils/prop-names');

var ThreeJSDetailsView = LayerDetailsView.extend({
  template: `
    <section>
      <header>
        <div class="columns">
          <h3 class="column">Details for <span data-hook="name"></span> <small data-hook="type"></small></h3>
          <div class="column no-grow columns">
            <div class="column no-grow"><button class="yes" title="Edit render function" name="edit-setup-function">Setup</button></div>
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
    'click [name=edit-setup-function]': '_editSetupFunction',
    'click [name=edit-update-function]': '_editUpdateFunction'
  }),

  _editSetupFunction: function() {
    this.editFunction('setupFunction', {
      importantNote: 'Do not forget to call <code>ready()</code>'
    });
  },
  _editUpdateFunction: function() {
    this.editFunction('updateFunction');

  }
});

module.exports = ThreeJSDetailsView;