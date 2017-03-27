'use strict';
/*global store, width, height, layer, grid, beginPath, closePath, dot, circle, polygone, moveTo, lineTo, fillStyle, stroke, strokeStyle, lineWidth, clearRect, timeDomain, frequency, bufferLength, restoreContexts, cacheContext*/
window.VF = window.VF || {};

var canvasLayers = [
//   {
//     name: 'levels',
//     active: false,
//     zIndex: 0,
//     props: {
//       levelA: ['number', true, 30],
//       levelB: ['number', true, 120]
//     },
//     drawFunction: function () {
//   lineWidth(1);
//   strokeStyle('#fff');

//   beginPath();
//   moveTo(0, height - layer.levelA);
//   lineTo(width, height - layer.levelA);
//   stroke();

//   beginPath();
//   moveTo(0, height - layer.levelB);
//   lineTo(width, height - layer.levelB);
//   stroke();

//   // -----------------------------------
//   var length = bufferLength();
//   var barWidth = (width / length) - 1;
//   var f = 0;
//   var alpha;
//   lineWidth(barWidth);

//   grid(length, 1, function(x) {
//     var td = timeDomain(f) * 1;
//     var freq = frequency(f);

//     alpha = td > layer.levelA && td < layer.levelB ? 0.7 : 0;
//     strokeStyle('rgba(160,122,122,' + alpha + ')');
//     beginPath();
//     moveTo(x, height);
//     lineTo(x, height - td);
//     stroke();

//     alpha = freq > layer.levelA && freq < layer.levelB ? 0.7 : 0;
//     strokeStyle('rgba(122,122,160,' + alpha + ')');
//     beginPath();
//     moveTo(x, height);
//     lineTo(x, height - freq);
//     stroke();
//     f++;
//   });
// }.toString()
//   },
//   {
//     name: 'audio1',
//     active: false,
//     zIndex: 0,
//     props: {
//       colorA: ['string', true, '#A581FF'],
//       widthA: ['number', true, 1],
//       colorB: ['string', true, '#66D9EF'],
//       widthB: ['number', true, 1]
//     },
//     drawFunction: function () {
//   var x = width * 0.5;
//   var y = height * 0.5;
//   var r = Math.min(x, y) - 20;
//   var rad = Math.PI * 2;
//   var length = bufferLength();
//   var shift1 = Math.PI * 0.5;
//   var shift2 = Math.PI * 1.5;

//   var i, a, f, td, lx, ly;

//   // -----------------------------

//   strokeStyle(layer.colorA);
//   lineWidth(layer.widthA);
//   beginPath();
//   for (i = 0; i < length; i++) {
//     a = ((rad / length) * i) - shift1;
//     f = (r / 100) * (frequency(i) / 2);
//     lx = Math.round(x + Math.cos(a) * f);
//     ly = Math.round(y + Math.sin(a) * f);
//     lineTo(lx, ly);
//   }
//   stroke();

//   beginPath();
//   i = 0;
//   lineTo(0, height * 0.5);
//   lineTo(width, height * 0.5);
//   stroke();

//   beginPath();
//   grid(length, 1, function(x, y){
//     lineTo(x, y + (frequency(i) * 0.5));
//     i++;
//   });
//   stroke();

//   // -----------------------------

//   strokeStyle(layer.colorB);
//   lineWidth(layer.widthB);
//   beginPath();
//   for (i = 0; i < length; i++) {
//     a = ((rad / length) * i) - shift2;
//     td = (r / 100) * (timeDomain(i) / 2);
//     lx = Math.round(x + Math.cos(a) * td);
//     ly = Math.round(y + Math.sin(a) * td);
//     lineTo(lx, ly);
//   }
//   stroke();

//   beginPath();
//   i = 0;
//   lineTo(0, height * 0.5);
//   lineTo(width, height * 0.5);
//   stroke();

//   beginPath();
//   grid(length, 1, function(x, y){
//     lineTo(x, y + (timeDomain(i) * 0.5));
//     i++;
//   });
//   stroke();
// }.toString()
//   },


  {
    name: 'lines',
    active: true,
    zIndex: 50,
    props: {
      text:['string', true, 'Hello World!'],
      toggleA: ['boolean', true, false],
      knobA: ['number', true, 127],
      knobB: ['number', true, 127],
      knobC: ['number', true, 127]
    },
    drawFunction: function () {
  var l = bufferLength();

  // var str = layer.text || '';
  // var letters = str.length <= l ? repeat('', Math.round((l - str.length) / 2))
  //               .concat(str.split('')) : str.split('');
  var f = 0;
  var k = Math.round(layer.knobA * 0.05);
  var p = Math.max(1, k);
  var d = Math.pow(2, p);

  // textAlign('center');
  // textBaseline('middle');

  grid(l, l / d, function(...args) {
    fillStyle('black');
    fillStyle('hsl('+(timeDomain(f) * 3)+', '+layer.knobB+'%, '+layer.knobB+'%)');
    strokeStyle('hsl('+(timeDomain(f) * 3)+', '+layer.knobB+'%, '+layer.knobB+'%)');

    // circle(...args, timeDomain(f) * 0.1);
    polygone(...args, timeDomain(f) * layer.knobC * 0.05);
    // font('20px monospace');
    // font('20px monospace');
    // txt(letters[f], ...args);
    f++;
  });
}.toString()
  }
];

window.VF._defaultSetup = {
  mappings: [
    {
      targets: [
        'layers.no-signal.opacity'
      ],
      transformFunction: 'function (value) {\n  return value > 90 ? 100 : 15;\n}',
      name: 'beatOpacity',
      source: 'signals.beatA.result'
    },
    {
      targets: [
        'layers.no-signal.active'
      ],
      transformFunction: 'function (value, currentValue) {\n  if (!value) return currentValue;\n        return !currentValue;\n}',
      name: 'nk2.r1',
      source: 'midi:nk2.r1'
    },
    // {
    //   targets: [
    //     'layers.Sky-1-back.opacity',
    //     'layers.Sky-1-front.opacity'
    //   ],
    //   transformFunction: 'function (value) {\n  return Math.max(value - 1, 0) * (100 / 126);\n}',
    //   name: 'nk2.slider2',
    //   source: 'midi:nk2.slider2'
    // },
    // {
    //   targets: [
    //     'layers.Sky-1-back.active'
    //   ],
    //   transformFunction: 'function (value, currentValue) {\n  if (!value) return currentValue;\n        return !currentValue;\n}',
    //   name: 'nk2.r2',
    //   source: 'midi:nk2.r2'
    // },
    // {
    //   targets: [
    //     'layers.Sky-1-front.active'
    //   ],
    //   transformFunction: 'function (value, currentValue) {\n  if (!value) return currentValue;\n        return !currentValue;\n}',
    //   name: 'nk2.m2',
    //   source: 'midi:nk2.m2'
    // },
    {
      targets: [
        'layers.canvas.canvasLayers.lines.knobA'
      ],
      transformFunction: 'function (value) {\n  return value;\n}',
      name: 'nk2.knob1',
      source: 'midi:nk2.knob1'
    },
    {
      targets: [
        'layers.canvas.canvasLayers.lines.knobB'
      ],
      transformFunction: 'function (value) {\n  return value;\n}',
      name: 'nk2.knob2',
      source: 'midi:nk2.knob2'
    },
    {
      targets: [
        'layers.canvas.canvasLayers.lines.knobC'
      ],
      transformFunction: 'function (value) {\n  return value;\n}',
      name: 'nk2.knob3',
      source: 'midi:nk2.knob3'
    },
    // {
    //   targets: [
    //     'layers.zeropaper.opacity'
    //   ],
    //   transformFunction: 'function (value) {\n  return Math.max(value - 1, 0) * (100 / 126);\n}',
    //   name: 'nk2.slider6',
    //   source: 'midi:nk2.slider6'
    // },
    // {
    //   targets: [
    //     'layers.zeropaper.active'
    //   ],
    //   transformFunction: 'function (value, currentValue) {\n  if (!value) return currentValue;\n        return !currentValue;\n}',
    //   name: 'nk2.r6',
    //   source: 'midi:nk2.r6'
    // },
    // {
    //   targets: [
    //     'layers.vf.opacity'
    //   ],
    //   transformFunction: 'function (value) {\n  return Math.max(value - 1, 0) * (100 / 126);\n}',
    //   name: 'nk2.slider7',
    //   source: 'midi:nk2.slider7'
    // },
    // {
    //   targets: [
    //     'layers.vf.active'
    //   ],
    //   transformFunction: 'function (value, currentValue) {\n  if (!value) return currentValue;\n        return !currentValue;\n}',
    //   name: 'nk2.r7',
    //   source: 'midi:nk2.r7'
    // },
    {
      targets: [
        'layers.ar.styleProperties.--beat.value',
        'layers.vf.styleProperties.--beat.value'
      ],
      transformFunction: 'function (value) {\n  return (value % 100).toString();\n}',
      name: 'beatNum20Str',
      source: 'signals.beatA.result'
    },
    {
      targets: [
        'signals.beatA.input'
      ],
      transformFunction: 'function (value) {\n  return value + 63;\n}',
      name: 'beatKnob',
      source: 'midi:nk2.knob8'
    },
    // {
    //   targets: [
    //     'signals.colorA.hue'
    //   ],
    //   transformFunction: 'function (newVal, prevVal) {\n  return newVal;\n}',
    //   name: 'slider8Hue',
    //   source: 'midi:nk2.slider8'
    // }
  ],


  signals: [
    {
      type: 'hsla',
      defaultValue: '180,50%,50%,1',
      name: 'colorA',
      hue: 180,
      saturation: 50,
      lightness: 50,
      alpha: 100,
    },
    {
      type: 'beat',
      name: 'beatA',
      input: 120
    }
  ],


  layers: [
    // {
    //   type: 'img',
    //   name: 'no-signal',
    //   active: false,
    //   src: './assets/no-signal.jpg'
    // },
    // {
    //   type: 'img',
    //   name: 'Sky-1-back',
    //   active: false,
    //   src: './assets/sky1/sky1-back-grey.png'
    // },

    {
      type: 'canvas',
      name: 'canvas',
      active: true,
      mixBlendingMode: 'soft-light',
      canvasLayers: canvasLayers,
    },

    // {
    //   type: 'SVG',
    //   name: 'zeropaper',
    //   active: true,
    //   src: './assets/zeropaper-fat.svg',
    //   mixBlendingMode: 'overlay'
    // },

    {
      type: 'SVG',
      name: 'ar',
      active: true,
      src: './assets/algorave/algorave-stroke.svg'
    },

    {
      type: 'SVG',
      name: 'vf',
      active: true,
      src: './assets/visual-fiha.svg'
    },

    // {
    //   type: 'img',
    //   name: 'Sky-1-front',
    //   active: false,
    //   src: './assets/sky1/sky1-front-grey.png',
    //   opacity: 0
    // }
  ]
};
