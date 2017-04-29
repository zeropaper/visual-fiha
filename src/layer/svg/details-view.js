'use strict';
var DetailsView = require('./../details-view');
var propNamesExtractor = require('./../../utils/prop-names');
var assign = require('lodash.assign');

var SVGDetailsView = DetailsView.extend({
  template: `
    <section>
      <header>
        <div class="columns">
          <h3 class="column">Details for <span data-hook="name"></span> <small data-hook="type"></small></h3>
          <div class="column no-grow columns">
            <div class="column no-grow"><button class="yes" name="edit-svg-styles">CSS</button></div>
            <div class="column no-grow"><button class="vfi-eye" name="show-origin"></button></div>
          </div>
        </div>
        <h5 data-hook="object-path"></h5>
      </header>

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
    'click [name=show-origin]': '_showOrigin',
    'click [name=edit-svg-styles]': '_editSvgStyles',
    'click [name=style-prop-add]': 'addStyleProperty'
  }),

  _editSvgStyles: function() {
    var view = this;
    var id = view.model.getId();

    var cssStr = '';

    var styles = view.model.svgStyles;
    var selectors = Object.keys(styles);
    selectors.forEach(function(selector) {
      cssStr += `${ selector } {\n  ${ styles[selector].split(';').map(s => s.trim()).join(';\n  ').trim() }\n}`;
    });

    view.rootView.getEditor({
      tabName: id + ' SVG CSS',
      script: cssStr,
      language: 'css',
      title: id + ' layer styles',
      onshoworigin: function() {
        view.rootView.trigger('blink', 'layers.' + id);
      },
      autoApply: true,
      onvalidchange: function (str) {
        var parsed = {};
        str.split(/([^\{\}]+\{[^\{\}]+\})/igm).forEach(function(match) {
          match = match.trim();
          if (!match) return;
          match = match.split('{').map(s => s.split('}')[0].trim());
          parsed[match[0]] = match[1];
        });

        view.sendCommand('propChange', {
          path: 'layers.' + id,
          property: 'svgStyles',
          value: parsed
        });
      }
    });
  },

  derived: {
    propNames: {
      deps: ['model'],
      fn: function() {
        return propNamesExtractor(this.model, [
          'content',
          'svgStyles',
          'layerStyles'
        ]);
      }
    }
  }
});

module.exports = SVGDetailsView;