'use strict';
var assign = require('lodash.assign');
var DetailsView = require('./../controller/details-view');
var SignalDetailsView = DetailsView.extend({
  template: `
    <section class="row rows">
      <header class="row no-grow">
        <div class="columns">
          <h3 class="column">Details for <span data-hook="name"></span> <small data-hook="type"></small></h3>
        </div>
        <h5 data-hook="object-path"></h5>
      </header>

      <div class="inspector ">
        <div>Result: <span data-hook="result"></span></div>
      </div>

      <div class="rows row param-section">
        <h5>Parameters</h5>
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

  derived: {
    modelPath: {
      deps: ['model'],
      fn: function() {
        return this.model.modelPath;
      }
    }
  },

  bindings: assign({
    'model.name': '[data-hook=name]',
    'model.result': '[data-hook=result]'
  }, DetailsView.prototype.bindings)
});
module.exports = SignalDetailsView;