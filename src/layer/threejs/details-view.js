'use strict';
var DetailsView = require('./../details-view');
var StylePropertyView = DetailsView.StylePropertyView;
var assign = require('lodash.assign');
var propNamesExtractor = require('./../../prop-names');


var ThreeJSDetailsView = DetailsView.extend({
  template: `
    <section>
      <header>
        <div class="columns">
          <h3 class="column">Details for <span data-hook="name"></span> <small data-hook="type"></small></h3>
          <div class="column no-grow"><button class="vfi-eye" name="show-origin"></button></div>
        </div>
        <h5 data-hook="object-path"></h5>
      </header>

      <div class="row columns">
        <div class="columns"><input type="text" name="parameter-name" placeholder="parameterName" /></div>
        <div class="columns"><input type="text" name="parameter-default" /></div>
        <div class="columns no-grow"><button name="parameter-add" class="vfi-plus"></button></div>
      </div>
      <div class="row parameters" ></div>
      <hr/>

      <div class="row columns">
        <div class="columns"><input type="text" name="style-prop-name" placeholder="--css-var-name" /></div>
        <div class="columns"><input type="text" name="style-prop-default" placeholder="2px, 100%, " /></div>
        <div class="columns no-grow"><button name="style-prop-add" class="vfi-plus"></button></div>
      </div>
      <div class="row style-props" ></div>
      <hr/>

      <div class="row mappings props"></div>
    </section>
  `,

  events: assign(DetailsView.prototype.events, {
    'click [name=parameter-add]': 'addParameter'
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