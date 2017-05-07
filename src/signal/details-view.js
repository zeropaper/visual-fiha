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

      <div class="content"></div>
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