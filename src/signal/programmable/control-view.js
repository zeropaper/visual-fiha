'use strict';
var SignalControlView = require('./../control-view');

var ProgrammableSignalControlView = SignalControlView.types.programmable = SignalControlView.extend({
  template: `<section class="rows signal signal-programmable">
    <header class="columns">
      <!-- <h5 class="column no-grow signal-type"><span data-hook="type"></span></h5> -->
      <h3 class="column signal-name gutter-horizontal" data-hook="name"></h3>
      <div class="column no-grow"><button class="edit-update-function vfi-cog-alt"></button></div>
      <div class="column no-grow text-right"><button class="vfi-trash-empty remove-signal"></button></div>
    </header>
  </section>`,

  events: {
    'click .edit-update-function': '_editUpdateFunction',
    'click header h3': '_showDetails'
  },

  _editUpdateFunction: function () {
    var id = this.model.getId();
    var rootView = this.rootView;
    var path = 'signals.' + id;

    rootView.getEditor({
      tabName: id + ' updateFunction',
      script: this.model.updateFunction || '',
      language: 'javascript',
      title: path + '.updateFunction',
      onshoworigin: function() {
        rootView.trigger('blink', path);
      },
      autoApply: true,
      onvalidchange: function doneEditingSignalFunction(str) {
        rootView.sendCommand('propChange', {
          path: path,
          property: 'updateFunction',
          value: str
        });
      }
    });
  },
});

module.exports = ProgrammableSignalControlView;