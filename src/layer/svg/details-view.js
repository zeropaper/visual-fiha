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


  events: assign(DetailsView.prototype.events, {
    'click [name=show-origin]': '_showOrigin',
    'click [name=edit-svg-styles]': '_editSvgStyles',
    'click [name=style-prop-add]': 'addParameter'
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