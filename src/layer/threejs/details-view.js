'use strict';
var DetailsView = require('./../details-view');
var assign = require('lodash.assign');
var propNamesExtractor = require('./../../utils/prop-names');

var ThreeJSDetailsView = DetailsView.extend({
  template: `
    <section>
      <header>
        <div class="columns">
          <h3 class="column">Details for <span data-hook="name"></span> <small data-hook="type"></small></h3>
          <div class="column no-grow columns">
            <div class="column no-grow"><button class="yes" title="Edit render function" name="edit-render-function">Render</button></div>
            <div class="column no-grow"><button class="yes" title="Edit update function" name="edit-update-function">Update</button></div>
            <div class="column no-grow"><button class="vfi-eye" name="show-origin"></button></div>
          </div>
        </div>
        <h5 data-hook="object-path"></h5>
      </header>

      <div class="content"></div>
    </section>
  `,

  events: assign(DetailsView.prototype.events, {
    'click [name=edit-render-function]': '_editRenderFunction',
    'click [name=edit-update-function]': '_editUpdateFunction'
  }),

  _editRenderFunction: function() {
    this.editFunction('renderFunction');
  },
  _editUpdateFunction: function() {
    this.editFunction('updateFunction');
  },

  derived: {
    propNames: {
      deps: ['model'],
      fn: function() {
        return propNamesExtractor(this.model, [
          'renderFunction',
          'updateFunction',
          'layerStyles'
        ]);
      }
    }
  }
});

module.exports = ThreeJSDetailsView;