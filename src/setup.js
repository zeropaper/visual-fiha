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


//   {
//     name: 'lines',
//     active: false,
//     zIndex: 50,
//     props: {
//       text:['string', true, 'Hello World!'],
//       toggleA: ['boolean', true, false],
//       knobA: ['number', true, 127],
//       knobB: ['number', true, 127],
//       knobC: ['number', true, 127]
//     },
//     drawFunction: function () {
//   var l = bufferLength();

//   // var str = layer.text || '';
//   // var letters = str.length <= l ? repeat('', Math.round((l - str.length) / 2))
//   //               .concat(str.split('')) : str.split('');
//   var f = 0;
//   var k = Math.round(layer.knobA * 0.05);
//   var p = Math.max(1, k);
//   var d = Math.pow(2, p);

//   // textAlign('center');
//   // textBaseline('middle');

//   grid(l, l / d, function(...args) {
//     fillStyle('black');
//     fillStyle('hsl('+(timeDomain(f) * 3)+', '+layer.knobB+'%, '+layer.knobB+'%)');
//     strokeStyle('hsl('+(timeDomain(f) * 3)+', '+layer.knobB+'%, '+layer.knobB+'%)');

//     // circle(...args, timeDomain(f) * 0.1);
//     polygone(...args, timeDomain(f) * layer.knobC * 0.05);
//     // font('20px monospace');
//     // font('20px monospace');
//     // txt(letters[f], ...args);
//     f++;
//   });
// }.toString()
//   }
];

window.VF._defaultSetup = {
  mappings: [
  //   {
  //     targets: [
  //       'layers.no-signal.opacity'
  //     ],
  //     transformFunction: 'function (value) {\n  return value > 90 ? 100 : 15;\n}',
  //     name: 'beatOpacity',
  //     source: 'signals.beatA.result'
  //   },
  //   {
  //     targets: [
  //       'layers.no-signal.active'
  //     ],
  //     transformFunction: 'function (value, currentValue) {\n  if (!value) return currentValue;\n        return !currentValue;\n}',
  //     name: 'nk2.r1',
  //     source: 'midi:nk2.r1'
  //   },
  //   // {
  //   //   targets: [
  //   //     'layers.Sky-1-back.opacity',
  //   //     'layers.Sky-1-front.opacity'
  //   //   ],
  //   //   transformFunction: 'function (value) {\n  return Math.max(value - 1, 0) * (100 / 126);\n}',
  //   //   name: 'nk2.slider2',
  //   //   source: 'midi:nk2.slider2'
  //   // },
  //   // {
  //   //   targets: [
  //   //     'layers.Sky-1-back.active'
  //   //   ],
  //   //   transformFunction: 'function (value, currentValue) {\n  if (!value) return currentValue;\n        return !currentValue;\n}',
  //   //   name: 'nk2.r2',
  //   //   source: 'midi:nk2.r2'
  //   // },
  //   // {
  //   //   targets: [
  //   //     'layers.Sky-1-front.active'
  //   //   ],
  //   //   transformFunction: 'function (value, currentValue) {\n  if (!value) return currentValue;\n        return !currentValue;\n}',
  //   //   name: 'nk2.m2',
  //   //   source: 'midi:nk2.m2'
  //   // },
  //   {
  //     targets: [
  //       'layers.canvas.canvasLayers.lines.knobA'
  //     ],
  //     transformFunction: 'function (value) {\n  return value;\n}',
  //     name: 'nk2.knob1',
  //     source: 'midi:nk2.knob1'
  //   },
  //   {
  //     targets: [
  //       'layers.canvas.canvasLayers.lines.knobB'
  //     ],
  //     transformFunction: 'function (value) {\n  return value;\n}',
  //     name: 'nk2.knob2',
  //     source: 'midi:nk2.knob2'
  //   },
  //   {
  //     targets: [
  //       'layers.canvas.canvasLayers.lines.knobC'
  //     ],
  //     transformFunction: 'function (value) {\n  return value;\n}',
  //     name: 'nk2.knob3',
  //     source: 'midi:nk2.knob3'
  //   },
  //   // {
  //   //   targets: [
  //   //     'layers.zeropaper.opacity'
  //   //   ],
  //   //   transformFunction: 'function (value) {\n  return Math.max(value - 1, 0) * (100 / 126);\n}',
  //   //   name: 'nk2.slider6',
  //   //   source: 'midi:nk2.slider6'
  //   // },
  //   // {
  //   //   targets: [
  //   //     'layers.zeropaper.active'
  //   //   ],
  //   //   transformFunction: 'function (value, currentValue) {\n  if (!value) return currentValue;\n        return !currentValue;\n}',
  //   //   name: 'nk2.r6',
  //   //   source: 'midi:nk2.r6'
  //   // },
  //   // {
  //   //   targets: [
  //   //     'layers.vf.opacity'
  //   //   ],
  //   //   transformFunction: 'function (value) {\n  return Math.max(value - 1, 0) * (100 / 126);\n}',
  //   //   name: 'nk2.slider7',
  //   //   source: 'midi:nk2.slider7'
  //   // },
  //   // {
  //   //   targets: [
  //   //     'layers.vf.active'
  //   //   ],
  //   //   transformFunction: 'function (value, currentValue) {\n  if (!value) return currentValue;\n        return !currentValue;\n}',
  //   //   name: 'nk2.r7',
  //   //   source: 'midi:nk2.r7'
  //   // },
  //   {
  //     targets: [
  //       'layers.ar.styleProperties.--beat.value',
  //       'layers.vf.styleProperties.--beat.value'
  //     ],
  //     transformFunction: 'function (value) {\n  return (value % 100).toString();\n}',
  //     name: 'beatNum20Str',
  //     source: 'signals.beatA.result'
  //   },
  //   {
  //     targets: [
  //       'signals.beatA.input'
  //     ],
  //     transformFunction: 'function (value) {\n  return value + 63;\n}',
  //     name: 'beatKnob',
  //     source: 'midi:nk2.knob8'
  //   },
  //   // {
  //   //   targets: [
  //   //     'signals.colorA.hue'
  //   //   ],
  //   //   transformFunction: 'function (newVal, prevVal) {\n  return newVal;\n}',
  //   //   name: 'slider8Hue',
  //   //   source: 'midi:nk2.slider8'
  //   // }
    {
      name: 'knobAStr',
      source: 'midi:nk2.knob1',
      transformFunction: 'function(val) { return (val * (1 / 127)).toString(); }',
      targets: [
        'layers.three.parameters.paramA.value'
      ]
    }
  ],


  // signals: [
  //   {
  //     type: 'hsla',
  //     defaultValue: '180,50%,50%,1',
  //     name: 'colorA',
  //     hue: 180,
  //     saturation: 50,
  //     lightness: 50,
  //     alpha: 100,
  //   },
  //   {
  //     type: 'beat',
  //     name: 'beatA',
  //     input: 120
  //   }
  // ],


  layers: [
    {
      opacity: 100,
      zIndex: 1000,
      type: 'threejs',
      name: 'three',
      active: true,
      styleProperties: [
        {
          name: '--bla',
          value: 'block'
        }
      ],
      parameters: [
        {
          name: 'paramA',
          value: '0.1'
        }
      ],


      src: './assets/zeropaper/zeropaper-logo.obj',

      renderFunction: `function() {
  layer.material = new THREE.MeshLambertMaterial({
    color: 0xffffff
  });
  layer.redWire = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.5
  });
  layer.blueWire = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    wireframe: true,
    transparent: true,
    opacity: 0.5
  });

  layer.listenToAndRun(layer, 'change:model.src', function() {
    if (!layer.model.src || store.loaded) return;

    layer.objLoader.load(layer.model.src, function loaded(object) {
      object.name = 'sceneSubject';
      layer.scene.add(object);
      store.loaded = true;

      object.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = layer.material;
        }
      });

      var clone1 = object.clone();
      clone1.name = 'clone1';
      clone1.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = layer.redWire;
        }
      });
      layer.scene.add(clone1);

      var clone2 = object.clone();
      clone2.name = 'clone2';
      layer.scene.add(clone2);
      clone2.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
          child.material = layer.blueWire;
        }
      });
    });
  });

  layer.camera.position.set(150, 40, 20);
  layer.camera.lookAt(layer.scene.position);

  layer.directionalLight.position.set(100, 30, 15);
  layer.directionalLight.lookAt(layer.scene.position);

  /*
  var object = new THREE.DirectionalLightHelper(layer.directionalLight);
  object.name = 'directionalLightHelper';
  layer.scene.add(object);

  object = new THREE.AxisHelper(20);
  object.name = 'axisHelper';
  layer.scene.add(object);

  object = new THREE.GridHelper(200);
  object.name = 'gridHelper';
  layer.scene.add(object);
  */
}`,

      updateFunction: `function() {
  var screenState = layer.model.screenState;
  var audio = screenState.audio;
  var freq = audio.frequency;
  var vol = audio.timeDomain;

  var scale = Math.max(0.01, Math.min(1.6, Number(parameter('paramA'))));
  var speed = 1000;
  var dist = 200;
  var deg = (screenState.frametime % (speed * 360) / speed);

  var bla = layer.scene.getObjectByName('sceneSubject');
  if (bla) {
    bla.scale.set(1 + (vol[8] * scale), 1 + (vol[8] * scale), 1 + (vol[8] * scale));
    bla.rotation.set(55, deg, -8);

    var clone1 = layer.scene.getObjectByName('clone1');
    if (clone1) {
      layer.redWire.color = new THREE.Color('hsl('+ freq[12] +', 50%, 50%)');
      clone1.scale.set(bla.scale.x, bla.scale.y, bla.scale.z);
      clone1.rotation.set(bla.rotation.x, bla.rotation.y, bla.rotation.z);
      clone1.position.set(bla.position.x - ((vol[8] - 60) * 0.5), bla.position.y, bla.position.z);
    }

    var clone2 = layer.scene.getObjectByName('clone2');
    if (clone2) {
      layer.blueWire.color = new THREE.Color('hsl('+ freq[12] +', 50%, 50%)');
      clone2.scale.set(bla.scale.x, bla.scale.y, bla.scale.z);
      clone2.rotation.set(bla.rotation.x, bla.rotation.y, bla.rotation.z);
      clone2.position.set(bla.position.x + ((vol[8] - 60) * 0.5), bla.position.y, bla.position.z);
    }
  }

  /*
  var directionalLightHelper = layer.scene.getObjectByName('directionalLightHelper');
  directionalLightHelper.position.set(layer.directionalLight.position);
  directionalLightHelper.lookAt(layer.directionalLight.target.position);
  */

  layer.camera.position.set(Math.cos(deg) * dist, 40 + (vol[12] * 0.1), Math.sin(deg) * dist);
  layer.camera.lookAt(layer.scene.position);
}`
    },
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

    // {
    //   type: 'canvas',
    //   name: 'canvas',
    //   active: false,
    //   mixBlendingMode: 'soft-light',
    //   canvasLayers: canvasLayers,
    // },

    {
      zIndex: 1100,
      type: 'SVG',
      name: 'zeropaperLogo',
      src: './assets/zeropaper/zeropaper-fat.svg',
      mixBlendingMode: 'overlay'
    },

    // {
    //   type: 'SVG',
    //   name: 'ar',
    //   active: false,
    //   src: './assets/algorave/algorave-stroke.svg'
    // },

    // {
    //   zIndex: 1200,
    //   type: 'SVG',
    //   name: 'vf',
    //   src: './assets/visual-fiha.svg'
    // },

    // {
    //   type: 'img',
    //   name: 'Sky-1-front',
    //   active: false,
    //   src: './assets/sky1/sky1-front-grey.png',
    //   opacity: 0
    // }
  ]
};
