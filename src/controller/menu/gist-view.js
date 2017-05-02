/* global Request */
'use strict';
var View = require('./../control-view');

function resToJSON(res) {
  return res.json();
}

var toYaml = require('./../../utils/setup-to-yaml');


var GistView = View.extend({
  template: `
    <div class="columns">
      <div class="column"><input placeholder="Gist ID" name="gist-id"/></div>
      <div class="column no-grow"><button name="save-gist">Save gist</button></div>
      <a target="_blank">Open on GH</a>
    </div>
  `,

  events: {
    'change [name="gist-id"]': '_loadGist',
    'click [name="save-gist"]': '_saveGist'
  },

  session: {
    gistId: 'string',
    revision: 'any'
  },

  derived: {
    url: {
      deps: ['gistId'],
      fn: function() {
        return this.gistId ? 'https://gist.github.com/' + this.gistId : false;
      }
    }
  },

  bindings: {
    gistId: [
      {
        type: 'value',
        selector: '[name="gist-id"]'
      }
    ],
    url: [
      {
        type: 'attribute',
        name: 'href',
        selector: 'a'
      },
      {
        type: 'toggle',
        selector: 'a'
      }
    ]
  },

  _loadGist: function(done) {
    var view = this;
    if (!view.gistId) return done(new Error('No Gist ID'));
    done = typeof done === 'function' ? done : function(err) { console.error('gist loading error', err.message); };

    fetch('https://api.github.com/gists/' + view.gistId)
      .then(resToJSON)
      .then(function(json) {
        var content = json.files['visual-fiha-setup.yml'].content;
        done(null, content);
      }, done)
      .catch(done);
  },


  toYaml: function() {
    return toYaml(this.parent.toJSON());
  },

  _saveGist: function(evt) {
    evt.preventDefault();
    var method = 'POST';
    var url = 'https://api.github.com/gists';
    var view = this;

    // we can't update an anonymous gist... :/
    // var id = this.gistId;
    // if (id) {
    //   url += '/' + id;
    //   method = 'PATCH';
    // }

    var req = new Request(url, {
      method: method,
      body: JSON.stringify({
        description: 'This gist is a setup information for https://zeropaper.github.io/visual-fiha',
        public: true,
        files: {
          'visual-fiha-setup.yml': {
            content: view.toYaml()
          }
        }
      })
    });

    fetch(req)
      .then(resToJSON)
      .then(function(json) {
        view.gistId = json.id;
      });
  }
});
module.exports = GistView;
