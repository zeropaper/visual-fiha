'use strict';
var ThreeJSDetailsView = require('./details-view');
var assign = require('lodash.assign');

var ScreenLayerControlView = require('./../control-view');
module.exports = ScreenLayerControlView.types.threejs = ScreenLayerControlView.extend({
  template: `
    <section class="threejs-control">
      <header class="columns">
        <div class="column no-grow"><button class="active prop-toggle"></button></div>
        <div class="column no-grow"><button class="edit-css vfi-code"></button></div>
        <h5 class="column no-grow layer-type"><span data-hook="type"></span></h5>
        <h3 class="column layer-name gutter-horizontal" data-hook="name"></h3>
        <div class="column columns no-grow">
          <div class="column no-grow text-right"><button name="edit-setup-function">Setup</button></div>
          <div class="column no-grow text-right"><button name="edit-update-function">Update</button></div>
          <div class="column no-grow text-right"><button class="vfi-trash-empty remove-layer"></button></div>
        </div>
      </header>

      <div class="preview gutter-horizontal"></div>

      <div class="mappings props"></div>
    </section>
  `,

  events: assign(ScreenLayerControlView.prototype.events, {
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
  },

  _showDetails: function () {
    this.rootView.showDetails(new ThreeJSDetailsView({
      parent: this,
      model: this.model
    }));
  }
});