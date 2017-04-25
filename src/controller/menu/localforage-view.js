'use strict';

var localForage = require('./../../storage');

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
    localForage.keys().then(function(keys) {
      helper
        .attach(evt.target, function(selected) {
          evt.target.value = selected;
          helper.detach();
        })
        .fill(keys.map(s => s.replace('local-', '')));
    });
  },
  loadLocal: function(setupId, done) {
    done = typeof done === 'function' ? done : function(err) { if(err) console.error('localforage error', err.message); };
    return localForage.getItem(setupId)
            .then(function(setup) {
              done(null, setup);
            }, done)
            .catch(done);
  },
  saveLocal: function(setupId, done) {
    done = typeof done === 'function' ? done : function(err) { if(err) console.error('localforage error', err.message); };
    return localForage.setItem(setupId, this.parent.toJSON())
            .then(function() {
              done();
            }, done)
            .catch(done);
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