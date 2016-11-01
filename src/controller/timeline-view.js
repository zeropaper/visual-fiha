'use strict';
var View = window.VFDeps.View;

var TimelineView = View.extend({
  template: [
    '<div class="timeline columns">',
    '<div class="column no-grow timeline-controls rows">',
    '<div class="row">Record</div>',
    '<div class="row">Play</div>',
    '<div class="row" data-hook="currenttime">Play</div>',
    '</div>',
    '<div class="column timeline-graph"></div>',
    '</div>'
  ].join('\n'),

  derived: {
    totalLength: {
      deps: ['model'],
      fn: function() {
        return this.model.frametime;
      }
    },
    displayStart: {
      deps: [],
      fn: function() {

      }
    },
    displayEnd: {
      deps: [],
      fn: function() {

      }
    }
  },

  bindings: {
    'model.frametime': '[data-hook=currenttime]'
  },

  events: {
    'click .timeline-graph': '_seek'
  },

  _seek: function() {

  }
});
module.exports = TimelineView;