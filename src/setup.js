// (function() {
  'use strict';

  var _ctxs = {};
  function mkImgCtx(w, h, img) {
    var cacheName = w + '-' + h + '-' + Math.round((img.currentTime || 0) * 100) + '-' + img.src;

    if (!_ctxs[cacheName]) {
      var canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      var ctx = _ctxs[cacheName] = canvas.getContext('2d');

      var iw = img.width || img.videoWidth;
      var ih = img.height || img.videoHeight;

      var rw = w / iw;
      var rh = h / ih;
      var r = Math.max(rh, rw);
      var sw = (w - iw * r) / 2;
      var sh = (h - ih * r) / 2;

      ctx.drawImage(
      img,
      0, 0, iw, ih,
      sw, sh, iw * r, ih * r
    );
    }
    var k = Object.keys(_ctxs);
    var c = k.length;
    if (c > 100) {
      delete _ctxs[k[0]];
    }
    return _ctxs[cacheName].canvas;
  }

  var _cache = {};
  function loadImg(cw, ch, src, done) {
    if (_cache[src] === false) { return done(); }
    if (_cache[src]) { return done(null, _cache[src]); }

    var img = document.createElement('img');

    img.addEventListener('load', function() {
      _cache[src] = mkImgCtx(cw, ch, img);
      done(null, _cache[src]);
    });

    img.addEventListener('error', function() {
      var err = new Error('Cannot load image ' + src);
      _cache[src] = err;
      done(err);
    });

    _cache[src] = false;
    img.src = src;
  }

  var skies = [
    {
      back: './assets/sky1/sky1-back.png',
      middle: './assets/sky1/sky1-middle.png',
      front: './assets/sky1/sky1-front.png',
      frontCache: './assets/sky1/sky1-front-cache.png'
    },
    {
      back: './assets/sky1/sky1-back-grey.png',
      middle: './assets/sky1/sky1-middle-grey.png',
      front: './assets/sky1/sky1-front-grey.png',
      frontCache: './assets/sky1/sky1-front-cache-grey.png'
    },
    {
      back: './assets/sky2/sky2-back.png',
      middle: null,
      front: './assets/sky2/sky2-front.png',
      frontCache: null
    }
  ];

  var canvasLayers = [
    {
      name: 'back',
      active: false,
      weight: 0,
      drawFunction: function(ctx) {
        var cw = ctx.canvas.width;
        var ch = ctx.canvas.height;
        loadImg(cw, ch, skies[this.serie || 0].back, function(err, img) {
          if (!img) { return; }
          ctx.drawImage(img, 0, 0, cw, ch);
        });
      },
      props: {
        serie: ['number', true, 0]
      }
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
        lineCap: ['string', true, 'round'],
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
        var bw = Math.max(1, this.barWidth);

        var _ca = 100 - this.arbitraryA;
        var _cb = 100 - this.arbitraryB;
        var dbw = bw * 2;
        ctx.strokeStyle = this.strokeStyle;
        ctx.lineWidth = bw;
        ctx.lineCap = this.lineCap;

        vh = (ch / 200) * _ca;
        for (w = (hcw - (Math.floor(hcw / dbw) * dbw)); w <= cw; w += dbw) {
          ctx.beginPath();
          ctx.moveTo(w, vh);
          ctx.lineTo(w, ch - vh);
          ctx.stroke();
          ctx.closePath();
        }

        vw = (cw / 200) * _cb;
        for (h = (hch - (Math.floor(hcw / dbw) * dbw)); h <= ch; h += dbw) {
          ctx.beginPath();
          ctx.moveTo(vw, h);
          ctx.lineTo(cw - vw, h);
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
          default: '#fff'
        },
        lineCap: ['string', true, 'round'],
        arbitraryA: ['number', true, 10],
        arbitraryB: ['number', true, 10]
      },
      mappings: [
        {
          eventNames: 'color:a',
          targetProperty: 'strokeStyle'
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
          eventNames: 'mic:60',
          targetProperty: 'arbitraryB'
        }
      ]
    },

    {
      name: 'middle',
      active: false,
      weight: 6,
      drawFunction: function(ctx) {
        var cw = ctx.canvas.width;
        var ch = ctx.canvas.height;
        loadImg(cw, ch, skies[this.serie || 0].middle, function(err, img) {
          if (!img) { return; }
          ctx.drawImage(img, 0, 0, cw, ch);
        });
      },
      props: {
        serie: ['number', true, 0]
      }
    },
    {
      name: 'soundbars',
      active: false,
      weight: 15,
      drawFunction: function(ctx) {

        var screenView = this.parent;
        var analyser = screenView.audioAnalyser;
        var bufferLength = analyser.frequencyBinCount;
        var dataArray = screenView.audioAnalyserDataArray;

        analyser.getByteFrequencyData(dataArray);

        var barWidth = (screenView.width / bufferLength) * 2.5;
        var barHeight;
        var x = 0;
        for(var i = 0; i < bufferLength; i++) {
          barHeight = dataArray[i];
          ctx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
          ctx.fillRect(x, screenView.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      }
    },
    {
      name: 'front',
      blending: 'source-out',
      active: false,
      weight: 7,
      drawFunction: function(ctx) {
        var layerState = this;
        var cw = layerState.width;
        var ch = layerState.height;
        loadImg(cw, ch, skies[this.serie || 0].front, function(err, img) {
          if (!img) { return; }
          ctx.drawImage(img, 0, 0, cw, ch);
        });
      },
      props: {
        serie: ['number', true, 0]
      }
    },
    {
      name: 'frontCache',
      blending: 'source-out',
      weight: 8,
      active: false,
      drawFunction: function(ctx) {
        var layerState = this;
        var cw = layerState.width;
        var ch = layerState.height;
        loadImg(cw, ch, skies[this.serie || 0].frontCache, function(err, img) {
          if (!img) { return; }
          ctx.drawImage(img, 0, 0, layerState.width, layerState.height);
        });
      },
      props: {
        serie: ['number', true, 0]
      }
    }
  ];


  window.VF = window.VF || {};
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
            eventNames: 'effectSlider*3.6'
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
        type: 'rgbaSignal',
        defaultValue: '122,122,122,0.5',
        name: 'color:b',
        mappings: [
          {
            targetProperty: 'red',
            eventNames: ''
          },
          {
            targetProperty: 'green',
            eventNames: ''
          },
          {
            targetProperty: 'blue',
            eventNames: ''
          },
          {
            targetProperty: 'alpha',
            eventNames: ''
          }
        ]
      },
      {
        type: 'beatSignal',
        name: 'beat:a',
        input: 125
      },
      {
        type: 'default',
        name: 'effectSlider*3.6',
        transformations: [
          {
            name: 'math.multiply',
            arguments: [3.6]
          }
        ],
        mappings: [
          {
            targetProperty: 'input',
            eventNames: 'kp3:effectSlider:change'
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
      // {
      //   type: 'video',
      //   name: 'Video 1',
      //   active: false,
      //   src: './assets/fire-3.webm'
      // },
      {
        type: 'SVG',
        name: 'zeropaper',
        active: true,
        src: './assets/zeropaper-fat.svg'
      },
      {
        type: 'SVG',
        name: 'Visual Fiha',
        active: false,
        src: './assets/visual-fiha.svg'
      },
      {
        type: 'canvas',
        name: 'Canvas layer',
        active: false,
        canvasLayers: canvasLayers
      }
    ]
  };
// })();