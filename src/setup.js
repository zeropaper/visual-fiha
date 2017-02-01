'use strict';

window.VF = window.VF || {};

var canvasLayers = [
//   {
//     name: 'background',
//     weight: 0,
//     drawFunction: function(ctx) {
//       ctx.fillStyle = this.colorA;
//       ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
//     },
//     props: {
//       colorA: ['string', true, '#bbb']
//     }
//   },

//   {
//     name: 'vidA',
//     weight: 10,
//     active: false,
//     drawFunction: function(ctx) {
//       var url = this.src;
//       window.VF.canvas.loaders.video(url, function(err, video) {
//         if (!video) return;
//         ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, ctx.canvas.width, ctx.canvas.height);
//       });
//     },
//     props: {
//       reverse: ['boolean', true, false],
//       src: ['string', true, './assets/kd/fire.mp4']
//     }
//   },

//   // {
//   //   name: 'imgA',
//   //   weight: 20,
//   //   active: false,
//   //   drawFunction: function(ctx) {
//   //     var url = './assets/kd/kd_logo_final.svg';
//   //     window.VF.canvas.loaders.img(url, function(err, img) {
//   //       if (!img) return;
//   //       var is = Math.min(img.width, img.height);
//   //       var cs = Math.min(ctx.canvas.width, ctx.canvas.height);
//   //       var s = Math.min(is, cs);
//   //       var x = (ctx.canvas.width - s) * 0.5;
//   //       var y = (ctx.canvas.height - s) * 0.5;
//   //       ctx.drawImage(img, x, y, s, s);
//   //     });
//   //   },
//   //   props: {
//   //     colorA: ['string', true, '#bbb']
//   //   }
//   // },

//   {
//     name: 'panorama',
//     weight: 20,
//     active: false,
//     drawFunction: function(ctx) {
//       var url = this.src;
//       var shift = this.shift;
//       var frametime = this.screenState.frametime || 0;
//       window.VF.canvas.loaders.img(url, function(err, img) {
//         if (!img) return;
//         var iw = img.width;
//         var ih = img.height;
//         var cw = ctx.canvas.width;
//         var ch = ctx.canvas.height;
//         var fh = ch / ih;
//         var fw = cw / iw;
//         var sx = (frametime % (iw - (cw * fh)) + shift);
//         var dw = cw / fw;
//         var dh = ch / fh;

//         ctx.drawImage(img, sx, 0, iw, ih, 0, 0, dw, dh);
//       });
//     },
//     props: {
//       src: ['string', true, './assets/panorma-karl-marx-allee.jpg'],
//       shift: ['number', true, 0]
//     },
//   },

//   // {
//   //   name: 'grid',
//   //   active: true,
//   //   weight: 40,
//   //   drawFunction: window.VF.canvas.lines.grid,
//   //   props: {
//   //     lineColor: ['string', true, '#fff'],
//   //     lineWidth: ['number', true, 1],
//   //     randFactor: ['number', true, 0],
//   //     pointRows: ['number', true, 8],
//   //     pointRadius: ['number', true, 1],
//   //     pointsCount: ['number', true, 40]
//   //   },
//   // },

//   // {
//   //   name: 'loungeA',
//   //   active: false,
//   //   weight: 40,
//   //   drawFunction: function(ctx) {
//   //     var cw = ctx.canvas.width;
//   //     var ch = ctx.canvas.height;
//   //     var bw = Math.max(1, this.barWidth);
//   //     var bbw = this.borderWidth;
//   //     var sh = (bw - (ch % bw)) * 0.5;
//   //     var c = (ch / Math.max(2, bw)) + bw;
//   //     var s = this.frametime % cw;
//   //     var dl = window.VF.canvasTools.drawLine;
//   //     var b, l, r, y;

//   //     ctx.fillStyle = this.barColor;
//   //     ctx.strokeStyle = this.borderColor;


//   //     for (b = 0; b < c; b++) {
//   //       if (b % 2) {
//   //         l = s - cw;
//   //         r = l + cw;
//   //         y = (b * bw) - sh;
//   //         dl(ctx, l, y, r, y, bw, bbw);
//   //       }
//   //       else {
//   //         l = s + cw;
//   //         r = l - cw;
//   //         y = (b * bw) - sh;
//   //         dl(ctx, r, y, l, y, bw, bbw);
//   //       }
//   //     }
//   //   },
//   //   props: {
//   //     borderWidth: ['number', true, 0],
//   //     barWidth: ['number', true, 50],
//   //     barColor: ['string', true, 'rgb(234, 105, 41)'],
//   //     borderColor: ['string', true, 'rgb(236, 183, 156)'],
//   //     beat: ['number', true, 100]
//   //   },
//   // },

  {
    name: 'lines',
    active: false,
    weight: 50,
    drawFunction: `function(ctx) {
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
    }`,
    props: {
      barWidth: ['number', true, 50],
      barColor: ['string', true, '#fff'],
      borderColor: ['string', true, '#fff'],
      arbitraryA: ['number', true, 10],
      arbitraryB: ['number', true, 10]
    },
  },

//   // {
//   //   name: 'frametime',
//   //   active: false,
//   //   weight: 60,
//   //   drawFunction: window.VF.canvas.utils.frametime
//   // },

//   // {
//   //   name: 'audio',
//   //   active: false,
//   //   weight: 30,
//   //   drawFunction: window.VF.canvas.lines.roundFrequencies
//   // },

//   // {
//   //   name: 'fps',
//   //   active: false,
//   //   weight: 60,
//   //   drawFunction: window.VF.canvas.utils.fps
//   // }
];

window.VF._defaultSetup = {
  mappings: [
//     {
//       source: 'frametime',
//       target: 'signals.beat:a.frametime',
//       transform: 'function (v) {\n  return v * 0.5;\n}'
//     },
//     {
//       source: 'midi.inputs.nk2.slider1',
//       target: 'signals.color:a.lightness',
//       transform: 'function (v) {\n  return (v /127) * 100;\n}'
//     },
//     {
//       source: 'signals.beat:a.result',
//       target: 'signals.color:a.hue'
//     },
//     {
//       source: 'frametime',
//       target: 'layers.canvas.canvasLayers.background.opacity',
//       transform: 'function (v) {\n  return v % 100;\n}'
//     },
//     {
//       source: 'midi.inputs.nk2.r1',
//       target: 'layers.canvas.canvasLayers.background.active',
//       transform: 'function (v) {\n  return !!v;\n}'
//     },
//     {
//       source: 'signals.color:a.result',
//       target: 'layers.canvas.canvasLayers.background.colorA'
//     },
//     {
//       source: 'midi.inputs.nk2.slider2',
//       target: 'layers.canvas.canvasLayers.grid.lineWidth'
//     },
//     {
//       source: 'midi.inputs.nk2.knob2',
//       target: 'layers.canvas.canvasLayers.grid.randFactor'
//     },
//     {
//       source: 'midi.inputs.nk2.slider3',
//       target: 'layers.canvas.canvasLayers.grid.pointRadius'
//     }
  ],


  signals: [
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
      type: 'beatSignal',
      name: 'beat:a',
      input: 125
    },
  ],


  layers: [
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


// window.VF._defaultSetup = {
//   mappings: [],
//   signals: [],
//   layers: []
// };