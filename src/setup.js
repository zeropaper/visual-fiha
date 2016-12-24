'use strict';

window.VF = window.VF || {};

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
    name: 'vidA',
    weight: 10,
    active: false,
    drawFunction: function(ctx) {
      // var reverse = this.reverse;
      // var frametime = (this.frametime || 0) * 0.001;
      var url = this.src;
      // var cache = this.cache;
      window.VF.canvasTools.loadVideo(url, function(err, video) {
        if (!video) return;

        // var is = Math.min(video.videoWidth, video.videoHeight);
        // var cs = Math.min(ctx.canvas.width, ctx.canvas.height);
        // var s = Math.min(is, cs);
        // var x = (ctx.canvas.width - s) * 0.5;
        // var y = (ctx.canvas.height - s) * 0.5;


        // var ct = frametime % video.duration;
        // ct = reverse ? video.duration - ct : ct;
        // video.currentTime = ct;
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, ctx.canvas.width, ctx.canvas.height);
      });
    },
    props: {
      reverse: ['boolean', true, false],
      src: ['string', true, './assets/kd/fire.mp4']
      // src: ['string', true, './assets/kd/DJ Fresh ft. Rita Ora - Hot Right Now (Official Video).mp4';]
    }
  },

  // {
  //   name: 'imgA',
  //   weight: 20,
  //   active: false,
  //   drawFunction: function(ctx) {
  //     var url = './assets/kd/kd_logo_final.svg';
  //     window.VF.canvasTools.loadImg(url, function(err, img) {
  //       if (!img) return;
  //       var is = Math.min(img.width, img.height);
  //       var cs = Math.min(ctx.canvas.width, ctx.canvas.height);
  //       var s = Math.min(is, cs);
  //       var x = (ctx.canvas.width - s) * 0.5;
  //       var y = (ctx.canvas.height - s) * 0.5;
  //       ctx.drawImage(img, x, y, s, s);
  //     });
  //   },
  //   props: {
  //     colorA: ['string', true, '#bbb']
  //   }
  // },

  {
    name: 'panorama',
    weight: 20,
    active: false,
    drawFunction: function(ctx) {
      var url = this.src;
      var shift = this.shift;
      var frametime = this.screenState.frametime || 0;
      window.VF.canvasTools.loadImg(url, function(err, img) {
        if (!img) return;
        var iw = img.width;
        var ih = img.height;
        var cw = ctx.canvas.width;
        var ch = ctx.canvas.height;
        var fh = ch / ih;
        var fw = cw / iw;
        var sx = (frametime % (iw - (cw * fh)) + shift);
        var dw = cw / fw;
        var dh = ch / fh;

        ctx.drawImage(img, sx, 0, iw, ih, 0, 0, dw, dh);
      });
    },
    props: {
      src: ['string', true, './assets/panorma-karl-marx-allee.jpg'],
      shift: ['number', true, 0]
    },
  },

  {
    name: 'loungeA',
    active: false,
    weight: 40,
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
  },

  // {
  //   name: 'circles',
  //   active: false,
  //   weight: 51,
  //   drawFunction: function(ctx) {
  //     var bw = Math.max(1, this.barWidth);
  //     var ch = ctx.canvas.height * 0.5;
  //     var cw = ctx.canvas.width * 0.5;
  //     var fs = this.frames;
  //     var f = this.frame;
  //     var r = Math.sqrt(Math.pow(cw, 2) + Math.pow(ch, 2));
  //     var dbw = bw * 2;
  //     var _ca = Math.round((this.arbitraryA -50) / 10);
  //     var _cb = Math.round((this.arbitraryB -50) / 10);
  //     var d = this.direction;
  //     var a = (Math.PI * 2) / (fs / f);
  //     var af = -1 * d * a;
  //     var at = d * a;

  //     ctx.strokeStyle = this.strokeStyle;
  //     ctx.lineWidth = bw;

  //     var i;
  //     for (i = 0; i < r / dbw; i++) {
  //       ctx.beginPath();
  //       ctx.arc(cw, ch, (1 + i) * dbw, af + (Math.PI * (i % _ca) / _cb), at - (Math.PI * (i % _ca) / _cb));
  //       ctx.stroke();
  //       ctx.closePath();
  //     }
  //   },
  //   props: {
  //     barWidth: {
  //       type: 'number',
  //       required: true,
  //       default: 10
  //     },
  //     strokeStyle: {
  //       type: 'string',
  //       required: true,
  //       default: '#000'
  //     },
  //     arbitraryA: ['number', true, 10],
  //     arbitraryB: ['number', true, 10]
  //   }
  // },

  {
    name: 'lines',
    active: false,
    weight: 50,
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
      ctx.barColor = this.barColor;
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
      barColor: ['string', true, '#fff'],
      borderColor: ['string', true, '#fff'],
      arbitraryA: ['number', true, 10],
      arbitraryB: ['number', true, 10]
    },
  },

  {
    name: 'frametime',
    active: false,
    weight: 60,
    drawFunction: function(ctx) {
      var cx = ctx.canvas.width * 0.5;
      var cy = ctx.canvas.height * 0.5;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = (cy * 0.25) + 'px monospace';
      var ft = Math.round(this.screenState.frametime) + 'ms';
      ctx.fillStyle = '#000';
      ctx.strokeStyle = '#fff';
      ctx.fillText(ft, cx, cy);
      ctx.strokeText(ft, cx, cy);
    }
  },

  {
    name: 'audio',
    active: true,
    weight: 30,
    drawFunction: function(ctx) {
      var audio = this.screenState.audio || {};
      var bufferLength = audio.bufferLength;
      var freqArray = audio.frequency;
      var timeDomainArray = audio.timeDomain;

      if (!bufferLength || !freqArray || !timeDomainArray) return;

      var x = ctx.canvas.width * 0.5;
      var y = ctx.canvas.height * 0.5;
      var r = Math.min(x, y) - 20;
      // var first;
      var rad = Math.PI * 2;

      var i = 0, a, f, td, lx, ly;
      ctx.strokeStyle = 'red';
      ctx.beginPath();
      for (i = 0; i < bufferLength; i++) {
        a = ((rad / bufferLength) * i) - Math.PI;
        f = (r / 100) * (freqArray[i] / 2);
        lx = Math.round(x + Math.cos(a) * f);
        ly = Math.round(y + Math.sin(a) * f);
        ctx.lineTo(lx, ly);
      }
      ctx.stroke();

      ctx.strokeStyle = 'azure';
      ctx.beginPath();
      for (i = 0; i < bufferLength; i++) {
        a = ((rad / bufferLength) * i) - Math.PI;
        td = (r / 100) * (timeDomainArray[i] / 2);
        lx = Math.round(x + Math.cos(a) * td);
        ly = Math.round(y + Math.sin(a) * td);
        ctx.lineTo(lx, ly);
      }
      ctx.stroke();
    }
  },

  {
    name: 'fps',
    active: true,
    weight: 60,
    drawFunction: function(ctx) {
      var cx = ctx.canvas.width * 0.5;
      var cy = ctx.canvas.height * 0.5;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = (cy * 0.25) + 'px monospace';

      var cache = this.cache;
      var screen = this.screenState;

      cache.previous = cache.previous || 0;
      var fps = Math.round(1000 / (screen.frametime - cache.previous)) + 'fps';
      ctx.lineWidth = 3;
      ctx.fillStyle = '#000';
      ctx.strokeStyle = '#fff';
      ctx.fillText(fps, cx, cy);
      ctx.strokeText(fps, cx, cy);
      cache.previous = screen.frametime;
    }
  }
];

window.VF._defaultSetup = {
  mappings: [
    {
      source: 'frametime',
      target: 'screenSignals.beat:a.frametime',
      transform: 'function (v) { return v * 0.5; }'
    },
    {
      source: 'frametime',
      target: 'screenLayers.canvas.canvasLayers.background.opacity',
      transform: 'function (v) { return v % 100; }'
    },
    {
      source: 'screenSignals.beat:a.result',
      target: 'screenSignals.color:a.hue'
    }
  ],


  screenSignals: [
    {
      type: 'hslaSignal',
      defaultValue: '180,50%,50%,1',
      name: 'color:a',
      hue: 180,
      saturation: 100,
      lightness: 50,
      alpha: 100,
    },
    {
      type: 'hslaSignal',
      defaultValue: '190,50%,50%,1',
      name: 'color:b',
      hue: 180,
      saturation: 100,
      lightness: 30,
      alpha: 100,
    },
    // {
    //   type: 'rgbaSignal',
    //   defaultValue: '122,122,122,0.5',
    //   name: 'color:b',
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
    }
  ],


  screenLayers: [
    {
      type: 'img',
      name: 'no-signal',
      active: true,
      src: './assets/no-signal.jpg'
    },
    {
      type: 'img',
      name: 'Sky-1-back',
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
      name: 'vf',
      active: false,
      src: './assets/visual-fiha.svg'
    },

    {
      type: 'SVG',
      name: 'KD',
      active: false,
      src: './assets/kd/kd_logo_final.svg'
    },

    {
      type: 'canvas',
      name: 'canvas',
      active: true,
      canvasLayers: canvasLayers
    },

    {
      type: 'img',
      name: 'Sky-1-front',
      active: false,
      src: './assets/sky1/sky1-front-grey.png'
    }
  ]
};
