'use strict';


var View = require('ampersand-view');
var LocalforageView = View.extend({
  template: `
    <div class="rows localforage-view">
      <div class="row columns">
        <div class="column"><input placeholder="Local ID" name="local-id"/></div>
        <div class="column no-grow"><button name="save">Save</button></div>
        <div class="column no-grow"><button name="restore" class="vfi-ccw" title="Reload"></button></div>
      </div>
    </div>
  `,
  events: {
    'focus [name=local-id]': '_suggestKeys',
    'click [name=restore]': '_restoreSetup',
    'click [name=save]': '_saveSetup'
  },
  _suggestKeys: function(evt) {
    var helper = this.parent.suggestionHelper;

    this.listenToOnce(this.parent, 'app:worker:storageKeys', function(data) {
      helper
        .attach(evt.target, function(selected) {
          evt.target.value = selected;
          helper.detach();
        })
        .fill((data.keys || []).map(s => s.replace('local-', '')));
    });

    this.parent.sendCommand('storageKeys');
  },

  saveLocal: function(setupId, done) {
    done = typeof done === 'function' ? done : function(err) { if(err) console.error('localforage error', err.message); };

    this.listenToOnce(this.parent, 'app:worker:storageSave', function(data, x) {
      console.info('storage save...', data, x);
      done(data.error);
    });

    this.parent.sendCommand('storageSave', {setupId: setupId});
  },

  _restoreSetup: function() {
    var id = 'local-' + this.query('[name=local-id]').value;
    var router = this.parent.router;
    router.loadSetup(id);
  },
  _saveSetup: function() {
    var id = 'local-' + this.query('[name=local-id]').value;
    var router = this.parent.router;
    this.saveLocal(id, function() {
      router.navigate('setup/' + id, {trigger: false, replace: false});
    });
  }
});
module.exports = LocalforageView;