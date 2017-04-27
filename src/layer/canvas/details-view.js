'use strict';

var assign = require('lodash.assign');
var LayerDetailsView = require('./../details-view');

var CanvasLayerDetailsView = LayerDetailsView.extend({
  template: `
    <section>
      <header>
        <div class="columns">
          <h3 class="column">Details for <span data-hook="name"></span> <small>sublayer</small></h3>
          <div class="columns no-grow column">
            <div class="column no-grow"><button name="edit-draw-function">Draw</button></div>
            <div class="column no-grow"><button class="vfi-eye" name="show-origin"></button></div>
          </div>
        </div>
        <h5 data-hook="object-path"></h5>
      </header>

      <div class="rows row param-section">
        <h5>Canvas layer parameters</h5>
        <div class="row columns">
          <div class="column"><input type="text" name="parameter-name" placeholder="param-a" /></div>
          <div class="column"><select name="parameter-type">
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="boolean">boolean</option>
            <option value="any">any</option>
          </select></div>
          <div class="column"><input type="text" name="parameter-default" placeholder="2px, 100%, ..." /></div>
          <div class="column no-grow"><button name="parameter-add" class="vfi-plus"></button></div>
        </div>
        <div class="row parameters" ></div>
      </div>
    </section>
  `,

  events: assign({
    'click [name=edit-draw-function]': '_editDrawFunction'
  }, LayerDetailsView.prototype.bindings),

  _editDrawFunction: function() {
    this.editFunction('drawFunction');
  }
});

module.exports = CanvasLayerDetailsView;