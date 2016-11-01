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
    // ctx.clearRect(0, 0, w, h);
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

var _videos = {};
function loadVideo(opts, done) {
  var cw = opts.width;
  var ch = opts.height;
  var src = opts.src;
  var startTime = opts.startTime || 0;
  var endTime = opts.endTime || 0;
  var cached = _videos[src];

  function mkCtx() {
    return mkImgCtx(cw, ch, _videos[src]);
  }
  if (cached === false) { return done(); }
  if (cached instanceof Error) { return done(cached); }
  if (cached) { return done(null, mkCtx()); }

  var vid = document.createElement('video');
  vid.volume = 0;
  vid.loop = false;

  function play() {
    if (vid.paused) {
      vid.play();
    }
    vid.currentTime = startTime;
  }
  vid.addEventListener('ended', play);

  vid.addEventListener('timeupdate', function() {
    if (endTime && vid.currentTime >= endTime) {
      play();
    }
  });

  /*
  var timetrack;
  if (endTime) {
    if (timetrack) {
      clearInterval(timetrack);
    }
    timetrack = setInterval(function() {
      if (endTime && vid.currentTime >= endTime) {
        console.info('timeupdate', vid.currentTime - endTime);
        play();
      }
    }, 1000 / 16);
  }
  else if (timetrack) {
    clearInterval(timetrack);
  }
  */

  vid.addEventListener('canplaythrough', function() {
    if (vid._loadedonce) { return done(null, mkCtx()); }
    vid._loadedonce = true;
    _videos[src] = vid;

    play();

    done(null, mkCtx());
    // vid.removeEventListener('canplaythrough');
  });

  vid.addEventListener('error', function() {
    var err = new Error('Cannot load video ' + src);
    _videos[src] = err;

    done(err);
    // vid.removeEventListener('error');
  });

  _videos[src] = false;
  vid.src = src;
}

// clearImgs = function() {
//   _cache = {};
// };
// clearVideos = function() {
//   _videos = {};
// };

var skies = [
  {
    back: './assets/canvas/sky1/sky1-back.png',
    middle: './assets/canvas/sky1/sky1-middle.png',
    front: './assets/canvas/sky1/sky1-front.png',
    frontCache: './assets/canvas/sky1/sky1-front-cache.png'
  },
  {
    back: './assets/canvas/sky1/sky1-back-grey.png',
    middle: './assets/canvas/sky1/sky1-middle-grey.png',
    front: './assets/canvas/sky1/sky1-front-grey.png',
    frontCache: './assets/canvas/sky1/sky1-front-cache-grey.png'
  },
  {
    back: './assets/canvas/sky2/sky2-back.png',
    middle: null,
    front: './assets/canvas/sky2/sky2-front.png',
    frontCache: null
  }
];

var canvasLayers = [
  {
    name: 'back',
    active: false,
    weight: 0,
    drawFunction: function(ctx) {
      var layerState = this;
      var cw = layerState.width;
      var ch = layerState.height;
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
      var ch = this.height * 0.5;
      var cw = this.width * 0.5;
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
    name: 'video',
    active: true,
    weight: 1,
    drawFunction: function(ctx) {
      var layerState = this;
      var cw = layerState.width;
      var ch = layerState.height;
      // loadVideo({
      //   width: cw,
      //   height: ch,
      //   // src: './ignore/fire-2.mp4',
      //   src: './ignore/fire-3.webm',
      //   startTime: 1,
      //   endTime: 2
      // }, function(err, img) {
      //   if (!img) { return; }
      //   img.addEventListener('ended', function () {
      //     console.info('ended');
      //   });
      //   img.addEventListener('timeupdate', function () {
      //     console.info('timeupdate', img.currentTime);
      //   });
      //   ctx.drawImage(img, 0, 0, cw, ch);
      // });
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
      var cw = this.width;
      var ch = this.height;
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
      },
      // {
      //   eventNames: 'mic:100',
      //   targetProperty: 'shadowOffsetX'
      // },
      // {
      //   eventNames: 'mic:100',
      //   targetProperty: 'shadowOffsetY'
      // },
      // {
      //   eventNames: 'mic:100',
      //   targetProperty: 'shadowBlur'
      // }
    ]
  },

  {
    name: 'middle',
    active: false,
    weight: 6,
    drawFunction: function(ctx) {
      var layerState = this;
      var cw = layerState.width;
      var ch = layerState.height;
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
  // },
  // {
  //   name: 'info',
  //   active: false,
  //   drawFunction: function(ctx) {
  //     var f = this.frame;
  //     var fs = this.frames;
  //     var fps = this.fps;


  //     ctx.fillStyle = '#fff';
  //     ctx.fillRect(85, 85, 100, 150);

  //     ctx.fillStyle = '#000';
  //     var h = 100;
  //     ctx.fillText('fps: ' + fps, 100, h);
  //     h+=15;
  //     ctx.fillText('frames: ' + fs, 100, h);
  //     h+=15;
  //     ctx.fillText('frame: ' + f, 100, h);
  //     h+=15;
  //     ctx.fillText('direction: ' + this.direction, 100, h);
  //     h+=15;

  //     ctx.fillText('lines: ' + !this.skipLines, 100, h);
  //     h+=15;
  //     ctx.fillText('circles: ' + !this.skipCircles, 100, h);
  //     h+=15;

  //     ctx.fillText('circle A: ' + this.circlesCtrlA, 100, h);
  //     h+=15;
  //     ctx.fillText('circle B: ' + this.circlesCtrlB, 100, h);
  //     h+=15;
  //     ctx.fillText('line A: ' + this.linesCtrlA, 100, h);
  //     h+=15;
  //     ctx.fillText('line B: ' + this.linesCtrlB, 100, h);
  //   }
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
    {
      type: 'video',
      name: 'Video 1',
      active: false,
      src: './ignore/fire-3.webm'
    },
    {
      type: 'SVG',
      name: 'Vector 1',
      active: false,
      src: './ignore/SVG_logo.svg'
    },
    {
      type: 'canvas',
      name: 'Canvas layer',
      active: true,
      canvasLayers: canvasLayers
    }
  ]
};
// })();