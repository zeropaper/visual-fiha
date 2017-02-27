'use strict';
var View = require('./control-view');
var Collection = require('ampersand-collection');
var State = require('ampersand-state');

var Entry = State.extend({
  props: {
    time: 'date',
    command: 'string',
    payload: 'any'
  },

  derived: {
    timeFromStart: {
      deps: ['collection', 'collection.parent', 'collection.parent.starttime'],
      fn: function() {
        return this.collection.parent.starttime - this.time;
      }
    }
  }
});

var Entries = Collection.extend({
  model: Entry
});

var TimelineView = View.extend({
  template: `<div class="timeline rows">
  <div class="row no-grow columns">
    <div class="column no-grow"><button value="play" class="vfi-play"></button></div>
    <div class="column no-grow"><button value="stop" class="vfi-stop"></button></div>
    <div class="column no-grow"><button value="pause" class="vfi-pause"></button></div>

    <div class="column"></div>

    <div class="column no-grow">
      <label>Elapsed time</label>
      <span class="elapsedtime"></span>
    </div>

    <div class="column"></div>

    <div class="column no-grow">
      <label>Entries count</label>
      <span class="entries-count"></span>
    </div>
  </div>

  <div class="row canvas-wrapper">
    <canvas></canvas>
  </div>
</div>`,

  addEntries: function(...args) {
    this.entries.add(...args);
    this.trigger('change:entries');
  },

  initialize: function() {
    this.on('change:entries', function() {
      if (this.starttime > this.firsttime) this.starttime = this.firsttime;
      this.update();
    });
  },

  session: {
    playstate: 'string',
    starttime: ['date', true, Date.now],
    canvasPadding: ['number', true, 10]
  },

  collections: {
    entries: Entries
  },

  bindings: {
    elapsedtime: {
      selector: '.elapsedtime',
      type: function(el, value) {
        var sec = value * 0.001;
        var min = Math.floor(sec / 60);
        sec -= min * 60;
        var hr = Math.floor(min / 60);
        min -= hr * 60;
        el.textContent = (hr ? hr + 'h' : '') + (min ? min + 'm' : '') + Math.round(sec) +'s';
      }
    },
    entries: [
      {
        type: function(el) {
          el.textContent = this.entries.length;
        },
        selector: '.entries-count'
      }
    ]
  },

  derived: {
    firsttime: {
      deps: ['entries'],
      fn: function() {
        if (!this.entries.models.length) return Date.now();
        return this.entries.models[0].time;
      }
    },
    lasttime: {
      deps: ['entries'],
      fn: function() {
        if (!this.entries.models.length) return Date.now();
        return this.entries.models[this.entries.models.length - 1].time;
      }
    },
    ctx: {
      cache: false,
      deps: ['el'],
      fn: function() {
        if (!this.el) return false;
        var canvas = this.query('canvas');
        if (canvas.width !== canvas.parentNode.clientWidth || canvas.height !== canvas.parentNode.clientHeight) {
          canvas.width = canvas.parentNode.clientWidth;
          canvas.height = canvas.parentNode.clientHeight;
        }
        return canvas.getContext('2d');
      }
    },
    elapsedtime: {
      deps: ['starttime', 'lasttime'],
      fn: function() {
        return this.lasttime - this.starttime;
      }
    },
    msPerPx: {
      deps: ['ctx', 'elapsedtime'],
      fn: function() {
        if (!this.ctx) return 0;
        return (this.ctx.canvas.width - (this.canvasPadding * 2)) / this.elapsedtime;
      }
    },
    stats: {
      deps: ['entries'],
      fn: function() {
        var entries = this.entries.models;
        var obj = {
          firsttime: this.firsttime,
          lasttime: this.lasttime,
          commands: {}
        };
        var command;

        for (var i = 0; i < entries.length; i++) {
          command = entries[i].command;
          obj.commands[command] = obj.commands[command] || 0;
          obj.commands[command]++;
        }

        return obj;
      }
    }
  },

  _drawGrid: function() {
    var ctx = this.ctx;
    if (!ctx) return this;

    var padding = this.canvasPadding;
    var xMax = ctx.canvas.width - (padding * 2);
    var xStep = xMax / 10;
    var yBot = 0;
    var yTop = padding;
    var c;
    var label;
    var rad = Math.PI * - 0.5;
    var x = 0;
    var count = 10;
    var timestep = this.elapsedtime / (count * 1000);

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';

    var items = [];
    for (c = 0; c <= count; c++) {
      label = Math.round(timestep * c) + 's';
      yBot = Math.max(yBot, ctx.measureText(label).width);
      items.push({
        label: label,
        x: Math.round(x + padding) + 0.5
      });
      x += xStep;
    }

    yBot += padding * 2;
    yBot = ctx.canvas.height - yBot;

    for (c = 0; c <= count; c++) {
      ctx.beginPath();
      ctx.moveTo(items[c].x, yBot);
      ctx.lineTo(items[c].x, yTop);
      ctx.stroke();

      ctx.save();
      ctx.translate(items[c].x, yBot);
      ctx.rotate(rad);
      ctx.fillText(items[c].label, 0 - padding, 0);
      ctx.restore();
    }

    return this;
  },

  update: function() {
    var ctx = this.ctx;
    if (!ctx) return this;

    var width = ctx.canvas.width;
    var height = ctx.canvas.height;
    ctx.clearRect(0, 0, width, height);

    this._drawGrid();

    var padding = this.canvasPadding;
    var msPerPx = this.msPerPx;
    var starttime = this.starttime;
    var entries = this.entries.models;

    function x(entry) {
      return (msPerPx * (entry.time - starttime)) + padding;
    }

    ctx.fillStyle = '#fff';
    // ctx.strokeStyle = 'red';

    for (var e = 0; e < entries.length; e++) {
      ctx.beginPath();
      ctx.arc(x(entries[e]), height * 0.5, 2, 0, Math.PI * 2);
      ctx.fill();
      // ctx.stroke();
    }

    return this;
  }
});
module.exports = TimelineView;