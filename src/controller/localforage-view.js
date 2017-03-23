'use strict';

var localForage = require('./../storage');

var View = require('ampersand-view');
var LocalforageView = View.extend({
  template: `
    <div class="columns localforage-view">
      <div class="column columns no-grow">
        <div class="column"><button name="snapshot-save" title="Take snapshot">Snapshot</button></div>
        <div class="column"><button name="snapshot-restore" class="vfi-ccw" title="Restore snapshot"></button></div>
      </div>
      <div class="column columns">
        <div class="column"><input placeholder="Local ID" name="local-id"/></div>
        <div class="column no-grow"><button name="save">Save</button></div>
        <div class="column"><button name="restore" class="vfi-ccw" title="Reload"></button></div>
      </div>
    </div>
  `,
  events: {
    'click [name=snapshot-restore]': '_restoreSnapshot',
    'click [name=snapshot-save]': '_saveSnapshot',
    'click [name=restore]': '_restoreSetup',
    'click [name=save]': '_saveSetup'
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
  _restoreSnapshot: function() {
    var controlView = this.parent;
    this.loadLocal('snapshot', function(err, setup) {
      if (err) throw err;
      controlView.fromJSON(setup);
    });
  },
  _saveSnapshot: function() {
    this.saveLocal('snapshot', function(err) {
      if (err) throw err;
    });
  },
  _restoreSetup: function() {
    var controlView = this.parent;
    var id = 'local-' + this.query('[name=local-id]').value;
    this.loadLocal(id, function(err, setup) {
      if (err) throw err;
      controlView.fromJSON(setup);
      controlView._setupEditor();
    });
  },
  _saveSetup: function() {
    var id = 'local-' + this.query('[name=local-id]').value;
    this.saveLocal(id, function() {
      console.info('saved setup to local storage as ' + id);
    });
  }
});
module.exports = LocalforageView;