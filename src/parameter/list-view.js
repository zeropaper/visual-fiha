'use strict';
var ParamView = require('./view');
var ControlView = require('./../controller/control-view');
var ParameterListView = ControlView.extend({
  template: `<div class="row param-section">
    <h5>Parameters</h5>
    <div class="columns">
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
    <div class="parameters" ></div>
  </div>`,

  initialize: function() {
    ControlView.prototype.initialize.apply(this, arguments);
    this.model = this.model || this.parent.model;
    if (!this.model.parameters) throw new Error('Missing parameters collection');
  },

  events: {
    'click [name=parameter-add]': 'addParameter'
  },

  addParameter: function() {
    if (!this.model.parameters) return;
    var val = this.query('[name=parameter-default]').value;
    var parameter = {
      name: this.query('[name=parameter-name]').value,
      type: this.query('[name=parameter-type]').value,
      default: val,
      value: val
    };
    this.rootView.sendCommand('addParameter', {
      path: this.model.modelPath,
      parameter: parameter
    });
  },

  render: function() {
    ControlView.prototype.render.apply(this, arguments);

    this.parameters = this.parameters || this.renderCollection(this.model.parameters, function (opts) {
      var Constructor = (ParamView.names[opts.model.name] || ParamView.types[opts.model.type] || ParamView);
      return new Constructor(opts);
    }, '.parameters');

    return this;
  }
});
module.exports = ParameterListView;