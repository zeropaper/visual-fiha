/* global Request */
'use strict';
var View = require('./control-view');
var jsYAML = require('js-yaml');

function toJSON(res) {
  return res.json();
}

var GistView = View.extend({
  template: `
    <div class="columns">
      <div class="column"><input placeholder="Gist ID" name="gist-id"/></div>
      <div class="column no-grow"><button name="save-gist">Save gist</button></div>
    </div>
  `,

  events: {
    'change [name="gist-id"]': '_loadGist',
    'click [name="save-gist"]': '_saveGist'
  },

  session: {
    gistId: 'string',
    revision: 'any',
    url: 'string'
  },

  bindings: {
    gistId: {
      type: 'value',
      selector: '[name="gist-id"]'
    },
    url: {
      type: 'attribute',
      name: 'href',
      selector: 'a'
    }
  },

  _loadGist: function() {
    var id = this.gistId;
    var parent = this.parent;
    if (!id) return;
    fetch('https://api.github.com/gists/' + id)
      .then(toJSON)
      .then(function(json) {
        // var setupJson = jsYAML.safeLoad(json.files['visual-fiha-setup.yml'].content);
        // parent.fromJSON(setupJson);
        parent.codeEditor.editCode(json.files['visual-fiha-setup.yml'].content, function updateSetupFromGist(newStr) {
          var obj;
          try {
            obj = jsYAML.safeLoad(newStr);
            parent.fromJSON(obj);
          }
          catch(e) {
            console.warn(e);
          }
        }, 'yaml');
      });
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
            content: jsYAML.safeDump(JSON.parse(JSON.stringify(this.parent.toJSON())))
          }
        }
      })
    });

    fetch(req)
      .then(toJSON)
      .then(function(json) {
        view.gistId = json.id;
      });
  }
});
module.exports = GistView;
