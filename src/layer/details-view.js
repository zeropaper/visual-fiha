'use strict';
var DetailsView = require('./../controller/details-view');
var LayerDetailsView = DetailsView.extend({
  template: `
    <section>
      <header>
        <h3>Details for <span data-hook="name"></span></h3>
      </header>

      <div class="row mappings props"></div>

      <div class="row gutter transformations-control columns">
    </section>
  `,

  bindings: {
    'model.name': '[data-hook=name]'
  }
});
module.exports = LayerDetailsView;