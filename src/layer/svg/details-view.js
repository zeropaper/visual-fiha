'use strict';
var DetailsView = require('./../details-view');



var SVGDetailsView = DetailsView.extend({
  template: `
    <section>
      <header>
        <h3>Details for <span data-hook="name"></span></h3>
      </header>

      <div class="row svg-vars" ></div>
      <hr/>
      <div class="row mappings props"></div>
    </section>
  `,

  derived: {
    propNames: {
      deps: ['model'],
      fn: function() {
        var def = this.model.constructor.prototype._definition;
        return Object.keys(def)
          .filter(function(key) {
            return [
              'content',
              'svgStyles',

              'name',
              'type',
              'zIndex'
            ].indexOf(key) < 0;
          });
      }
    }
  }
});

module.exports = SVGDetailsView;