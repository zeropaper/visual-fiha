'use strict';
window.VF = window.VF || {};

window.VF.canvasTools = {};

window.VF.canvasTools.drawPoint = function(ctx, x, y, radius, borderWidth, num) {
  var fs  = ctx.fillStyle;
  ctx.fillStyle = '#000';
  var lw = ctx.lineWidth;
  ctx.lineWidth = borderWidth;


  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.beginPath();
  // ctx.moveTo(x - radius, y);
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();

  if (typeof num !== 'undefined') {
    ctx.fillStyle = '#fff';
    ctx.fillText(num, x, y);
  }

  ctx.lineWidth = lw;
  ctx.fillStyle = fs;
};

window.VF.canvasTools.drawLine = function(ctx, x1, y1, x2, y2, width, borderWidth, vertical) {
  var halfWidth = width * 0.5;
  var adj = Math.abs(y1 - y2);
  var opp = Math.abs(x1 - x2);
  var tilt = Math.atan(adj / opp) || 0;

  var a = (Math.PI * 0.5) + tilt;
  var b = (Math.PI * 1.5) + tilt;
  var dp = window.VF.canvasTools.drawPoint;

  ctx.lineWidth = borderWidth;
  ctx.beginPath();

  ctx.arc(x1, y1, halfWidth, a, b);

  ctx.arc(x2, y2, halfWidth, b, a);

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

var canvasLayers = [
  {
    name: 'background',
    weight: 0,
    drawFunction: function(ctx) {
      ctx.fillStyle = this.colorA;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    },
    props: {
      colorA: ['string', true, '#bbb']
    }
  },

  {
    name: 'loungeA',
    active: false,
    weight: 1,
    drawFunction: function(ctx) {
      var cw = ctx.canvas.width;
      var ch = ctx.canvas.height;
      var bw = Math.max(1, this.barWidth);
      var bbw = this.borderWidth;
      var sh = (bw - (ch % bw)) * 0.5;
      var c = (ch / Math.max(2, bw)) + bw;
      var s = this.frametime % cw;
      var dl = window.VF.canvasTools.drawLine;
      var b, l, r, y;

      ctx.fillStyle = this.barColor;
      ctx.strokeStyle = this.borderColor;


      for (b = 0; b < c; b++) {
        if (b % 2) {
          l = s - cw;
          r = l + cw;
          y = (b * bw) - sh;
          dl(ctx, l, y, r, y, bw, bbw);
        }
        else {
          l = s + cw;
          r = l - cw;
          y = (b * bw) - sh;
          dl(ctx, r, y, l, y, bw, bbw);
        }
      }
    },
    props: {
      borderWidth: ['number', true, 0],
      barWidth: ['number', true, 50],
      barColor: ['string', true, 'rgb(234, 105, 41)'],
      borderColor: ['string', true, 'rgb(236, 183, 156)'],
      beat: ['number', true, 100]
    },
    mappings: [
      {
        eventNames: 'kp3:effectSlider:change',
        targetProperty: 'barWidth'
      },
      {
        eventNames: 'kp3:effectKnob:change',
        targetProperty: 'borderWidth'
      },
      {
        eventNames: 'beat:a',
        targetProperty: 'beat'
      },
      {
        eventNames: 'color:a',
        targetProperty: 'barColor'
      },
      {
        eventNames: 'color:b',
        targetProperty: 'borderColor'
      }
    ]
  },

  {
    name: 'circles',
    active: false,
    weight: 2,
    drawFunction: function(ctx) {
      var _debug = this.collection.parent._debugNextUpdate;

      var bw = Math.max(1, this.barWidth);
      var ch = ctx.canvas.height * 0.5;
      var cw = ctx.canvas.width * 0.5;
      var fs = this.frames;
      var f = this.frame;
      var r = Math.sqrt(Math.pow(cw, 2) + Math.pow(ch, 2));
      var dbw = bw * 2;
      var _ca = Math.round((this.arbitraryA -50) / 10);
      var _cb = Math.round((this.arbitraryB -50) / 10);
      var d = this.direction;
      if (_debug) {
        console.info('layer state draw function (circles)', this, bw, cw, ch);
      }

      var a = (Math.PI * 2) / (fs / f);
      var af = -1 * d * a;
      var at = d * a;

      ctx.strokeStyle = this.strokeStyle;
      ctx.lineWidth = bw;

      var i;
      for (i = 0; i < r / dbw; i++) {
        ctx.beginPath();
        ctx.arc(cw, ch, (1 + i) * dbw, af + (Math.PI * (i % _ca) / _cb), at - (Math.PI * (i % _ca) / _cb));
        ctx.stroke();
        ctx.closePath();
      }
    },
    props: {
      barWidth: {
        type: 'number',
        required: true,
        default: 10
      },
      strokeStyle: {
        type: 'string',
        required: true,
        default: '#000'
      },
      arbitraryA: ['number', true, 10],
      arbitraryB: ['number', true, 10]
    }
  },

  {
    name: 'lines',
    active: true,
    weight: 5,
    drawFunction: function(ctx) {
      var h;
      var w;
      var vh;
      var vw;
      var cw = ctx.canvas.width;
      var ch = ctx.canvas.height;
      var hcw = cw * 0.5;
      var hch = ch * 0.5;
      var bw = Math.max(1, this.barWidth || 0);
      var bbw = bw * 0.25;
      var dl = window.VF.canvasTools.drawLine;
      // dl(ctx, 100, 100, 200, 100, 50, 2);

      // dl(ctx, 100, 200, 200, 350, 50, 2);

      var _ca = 100 - this.arbitraryA;
      var _cb = 100 - this.arbitraryB;
      var dbw = bw * 2;
      ctx.strokeStyle = this.strokeStyle;
      // ctx.lineWidth = bw;

      vh = (ch / 200) * _ca;
      for (w = (hcw - (Math.floor(hcw / dbw) * dbw)); w <= cw; w += dbw) {
        dl(ctx, w, vh, w, ch - vh, bw, bbw);
      }

      vw = (cw / 200) * _cb;
      for (h = (hch - (Math.floor(hcw / dbw) * dbw)); h <= ch; h += dbw) {
        dl(ctx, vw, h, cw - vw, h, bw, bbw, true);
      }
    },
    props: {
      barWidth: ['number', true, 50],
      strokeStyle: {
        type: 'string',
        required: true,
        default: '#fff'
      },
      arbitraryA: ['number', true, 10],
      arbitraryB: ['number', true, 10]
    },
    mappings: [
      {
        eventNames: 'beat:a',
        targetProperty: 'opacity'
      },
      {
        eventNames: 'color:a',
        targetProperty: 'strokeStyle'
      },
      {
        eventNames: 'mic:12',
        targetProperty: 'arbitraryA'
      },
      {
        eventNames: 'mic:15',
        targetProperty: 'arbitraryB'
      }
    ]
  },

  {
    name: 'soundbars',
    active: false,
    weight: 15,
    drawFunction: function(ctx) {
      var cw = ctx.canvas.width;
      var ch = ctx.canvas.height;
      var screenState = this.screenState;
      var mic = screenState.signals.mic;
      var keys = Object.keys(mic);
      var barWidth = (cw / keys.length);
      var barHeight;
      var x = 0;
      keys.forEach(function(key) {
        barHeight = mic[key];
        ctx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
        ctx.fillRect(x, ch - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      });
    }
  }
];

window.VF._defaultSetup = {
  screenSignals: [
    {
      type: 'hslaSignal',
      defaultValue: '180,50%,50%,1',
      name: 'color:a',
      hue: 180,
      saturation: 100,
      lightness: 50,
      alpha: 100,
      mappings: [
        {
          targetProperty: 'hue',
          eventNames: 'padX*3.6'
        },
        {
          targetProperty: 'saturation',
          eventNames: ''
        },
        {
          targetProperty: 'lightness',
          eventNames: ''
        },
        {
          targetProperty: 'alpha',
          eventNames: ''
        }
      ]
    },
    {
      type: 'hslaSignal',
      defaultValue: '190,50%,50%,1',
      name: 'color:b',
      hue: 180,
      saturation: 100,
      lightness: 30,
      alpha: 100,
      mappings: [
        {
          targetProperty: 'hue',
          eventNames: 'padX*3.6'
        },
        {
          targetProperty: 'saturation',
          eventNames: ''
        },
        {
          targetProperty: 'lightness',
          eventNames: ''
        },
        {
          targetProperty: 'alpha',
          eventNames: ''
        }
      ]
    },
    // {
    //   type: 'rgbaSignal',
    //   defaultValue: '122,122,122,0.5',
    //   name: 'color:b',
    //   mappings: [
    //     {
    //       targetProperty: 'red',
    //       eventNames: ''
    //     },
    //     {
    //       targetProperty: 'green',
    //       eventNames: ''
    //     },
    //     {
    //       targetProperty: 'blue',
    //       eventNames: ''
    //     },
    //     {
    //       targetProperty: 'alpha',
    //       eventNames: ''
    //     }
    //   ]
    // },
    {
      type: 'beatSignal',
      name: 'beat:a',
      input: 125
    },
    {
      type: 'default',
      name: 'padX*3.6',
      transformations: [
        {
          name: 'math.multiply',
          arguments: [3.6]
        }
      ],
      mappings: [
        {
          targetProperty: 'input',
          eventNames: 'kp3:padX:change'
        }
      ]
    },
    {
      type: 'default',
      name: 'beat:a*3.6',
      transformations: [
        {
          name: 'math.multiply',
          arguments: [3.6]
        }
      ],
      mappings: [
        {
          targetProperty: 'input',
          eventNames: 'beat:a'
        }
      ]
    }
  ],


  screenLayers: [
    {
      type: 'img',
      name: 'Sky 1 back',
      active: false,
      src: './assets/sky1/sky1-back-grey.png'
    },
    {
      type: 'SVG',
      name: 'zeropaper',
      active: false,
      src: './assets/zeropaper-fat.svg'
    },
    {
      type: 'SVG',
      name: 'Visual Fiha',
      active: true,
      src: './assets/visual-fiha.svg'

    },
    {
      type: 'canvas',
      name: 'Canvas layer',
      active: true,
      canvasLayers: canvasLayers
    },
    {
      type: 'img',
      name: 'Sky 1 front',
      active: false,
      src: './assets/sky1/sky1-front-grey.png'
    }
  ]
};
