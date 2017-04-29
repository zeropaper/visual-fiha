'use strict';
var DetailsView = require('./../details-view');
var StylePropertyView = DetailsView.StylePropertyView;
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

      <div class="rows row param-section">
        <h5>Script parameters</h5>
        <div class="row columns">
          <div class="columns"><input type="text" name="parameter-name" placeholder="parameterName" /></div>
          <div class="columns"><input type="text" name="parameter-default" /></div>
          <div class="columns no-grow"><button name="parameter-add" class="vfi-plus"></button></div>
        </div>
        <div class="row parameters" ></div>
      </div>

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
    'click [name=parameter-add]': 'addParameter',
    'click [name=edit-render-function]': '_editRenderFunction',
    'click [name=edit-update-function]': '_editUpdateFunction'
  }),

  addParameter: function() {
    var val = this.query('[name=parameter-default]').value;
    var props = this.model.parameters.serialize();
    props.push({
      name: this.query('[name=parameter-name]').value,
      default: val,
      value: val
    });
    this.rootView.sendCommand('propChange', {
      path: 'layers.' + this.model.getId(),
      property: 'parameters',
      value: props
    });
  },

  _editRenderFunction: function() {
    this.editFunction('renderFunction');
  },
  _editUpdateFunction: function() {
    this.editFunction('updateFunction');
  },

  render: function() {
    DetailsView.prototype.render.apply(this, arguments);

    if (this.parameters) {
      this.parameters.remove();
    }

    if (this.model.parameters) {
      this.parameters = this.renderCollection(this.model.parameters, StylePropertyView, '.parameters');
    }

    return this;
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