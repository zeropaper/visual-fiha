'use strict';
window.VF = window.VF || {};

window.VF._defaultSetup = {
  mappings: [
    {
      name: 'knob1',
      source: 'midi:nk2.knob1',
      transformFunction: 'function(val) { return val.toString(); }',
      targets: [
        'layers.zero.parameters.knob1.value'
      ]
    },
    {
      name: 'knob2',
      source: 'midi:nk2.knob2',
      transformFunction: 'function(val) { return val.toString(); }',
      targets: [
        'layers.zero.parameters.knob2.value'
      ]
    },
    {
      name: 'knob3',
      source: 'midi:nk2.knob3',
      transformFunction: 'function(val) { return val.toString(); }',
      targets: [
        'layers.zero.parameters.knob3.value'
      ]
    },
    {
      name: 'knob4',
      source: 'midi:nk2.knob4',
      transformFunction: 'function(val) { return val.toString(); }',
      targets: [
        'layers.zero.parameters.knob4.value'
      ]
    },
    {
      name: 'slider1',
      source: 'midi:nk2.slider1',
      transformFunction: 'function(val) { return val.toString(); }',
      targets: [
        'layers.zero.parameters.slider1.value'
      ]
    },
    {
      name: 'slider2',
      source: 'midi:nk2.slider2',
      transformFunction: 'function(val) { return val.toString(); }',
      targets: [
        'layers.zero.parameters.slider2.value'
      ]
    },
    {
      name: 'slider3',
      source: 'midi:nk2.slider3',
      transformFunction: 'function(val) { return val.toString(); }',
      targets: [
        'layers.zero.parameters.slider3.value'
      ]
    },
    {
      name: 'slider4',
      source: 'midi:nk2.slider4',
      transformFunction: 'function(val) { return val.toString(); }',
      targets: [
        'layers.zero.parameters.slider4.value'
      ]
    },
    {
      name: 'beatResult',
      source: 'signals.beatA.result',
      transformFunction: 'function(val) { return val; }',
      targets: [
        'layers.zero.opacity'
      ]
    },
    {
      name: 'beatResultNeg',
      source: 'signals.beatA.result',
      transformFunction: 'function(val) { return 100 - val; }',
      targets: [
        'layers.zeropaperLogo.opacity'
      ]
    },
    {
      name: 'beatNumContructionPath',
      source: 'signals.beatA.beatNum',
      transformFunction: 'function(val) { return \'./assets/construction-work/\'+ ((val % 3) + 1) +\'/front.png\'; }',
      targets: [
        'layers.bgk.src',
        'layers.bgk2.src'
      ]
    }
  ],


  signals: [
    {
      type: 'beat',
      name: 'beatA',
      input: 85
    }
  ],


  layers: [
    {
      type: 'img',
      name: 'bgk',
      active: true,
      zIndex: 100,
      src: './assets/construction-work/1/front.png',
      layerStyles: 'filter: grayscale(1);transform: scale(calc(var(--vol4) * 0.01)) rotate(calc(0.05deg * var(--frametime)));'
    },


    {
      type: 'img',
      name: 'bgk2',
      active: true,
      zIndex: 200,
      src: './assets/construction-work/1/front.png',
      layerStyles: 'filter: grayscale(1);transform: scale(calc(var(--vol4) * 0.01)) rotateX(180deg) rotateY(180deg) rotate(calc(-0.05deg * var(--frametime)));'
    },


    {
      opacity: 100,
      zIndex: 1000,
      type: 'threejs',
      name: 'zero',
      active: true,

      currentCamera: 'defaultperspective',

      parameters: [
        {
          name: 'knob1',
          value: '63'
        },
        {
          name: 'knob2',
          value: '63'
        },
        {
          name: 'knob3',
          value: '63'
        },
        {
          name: 'knob4',
          value: '63'
        },
        {
          name: 'slider1',
          value: '63'
        },
        {
          name: 'slider2',
          value: '63'
        },
        {
          name: 'slider3',
          value: '63'
        },
        {
          name: 'slider4',
          value: '63'
        }
      ],

      loaders: [
        {
          name: 'fat',
          type: 'obj',
          path: './assets/zeropaper/',
          src: 'zeropaper-concrete.obj'
        // },
        // {
        //   name: 'concrete',
        //   type: 'objmtl',
        //   path: './assets/zeropaper/',
        //   src: 'zeropaper-concrete.obj',
        //   mtl: 'zeropaper-concrete.mtl',
        //   position: {
        //     x: 60,
        //     y: 30
        //   },
        //   scale: {
        //     x: 1.2,
        //     y: 1.2,
        //     z: 1.2
        //   }
        }
      ],

      renderFunction: `function() {
  // var helper = new THREE.AxisHelper(20);
  // helper.name = 'axisHelper';
  // layer.scene.add(helper);

  // helper = new THREE.GridHelper(200);
  // helper.name = 'gridHelper';
  // layer.scene.add(helper);

  function makeClones(object, count = 1) {
    for (var c = 1; c < count; c++) {
      var clone = object.clone();
      clone.traverse(function(child) {
        if (!child.material) return;
        child.material = child.material.clone();
        // child.material.wireframe = true; // provokes illegal operation 😢
      });
      clone.name = 'clone' + (c + 1);
      layer.scene.add(clone);
    }
  }

  var fatView = layer.loaders.views.filter(v => v.model.name === 'fat')[0];
  layer.listenToAndRun(fatView, 'change:object', function() {
    var fatObject = fatView.object;
    fatObject.traverse(function(child) {
      if (child.material) child.material.side = THREE.DoubleSide;
    });
    makeClones(fatObject, 8);
  });
}`,

      updateFunction: `function() {
  var screenState = layer.model.screenState;
  var audio = screenState.audio;
  var freq = audio.frequency;
  var vol = audio.timeDomain;

  var scale = freq[12] * 0.1;
  var speed = 1000;
  var dist = 200;
  var deg = (screenState.frametime % (speed * 360) / speed);
  var tilt = vol[4] - 127;

  layer.camera.position.set(Math.cos(deg) * dist, 15, Math.sin(deg) * dist);
  layer.camera.lookAt(layer.scene.position);

  var fat = layer.scene.getObjectByName('fat');
  fat.scale.set(scale + 1, scale + 1, scale + 1);
  fat.rotation.set(Math.PI * 0.35, midi2rad(parameter('knob1', 0)), midi2rad(parameter('knob2', 0)));

  function alterMaterials(c) {
    return function(child) {
      if (child.material && child.material.color) {
        child.material.wireframe = true;
        child.material.color = new THREE.Color('hsl('+ freq[c * 4] +', ' + parameter('slider1', 50) + '%, ' + parameter('slider2', 50) + '%)');
      }
    }
  }

  function applyClones(count = 1) {
    var cap = midiMinMax(parameter('knob3', 0), 0, count);
    for (var c = 0; c < count; c++) {
      var clone = layer.scene.getObjectByName('clone' + (c + 1));
      if (clone) {
        if (cap < c) {
          clone.visible = false;
          return;
        }

        clone.visible = true;
        clone.traverse(alterMaterials(c));

        var s = fat.scale.toArray();
        clone.scale.set(...s);

        var r = fat.rotation.toArray();
        clone.rotation.set(...r);

        var p = fat.position.toArray();
        p[Math.round(midiMinMax(parameter('slider3', 0), 0, 2))] = (c * vol[4] * 0.01 * (tilt * (c % 2 === 0 ? 1 : -1)));
        clone.position.set(...p);
      }
    }
  }
  applyClones(8);
}`,
    },


    {
      zIndex: 1100,
      type: 'SVG',
      opacity: 85,
      name: 'zeropaperLogo',
      src: './assets/zeropaper/zeropaper-fat.svg',
      layerStyles: 'mix-blend-mode: overlay;'
    }
  ]
};
