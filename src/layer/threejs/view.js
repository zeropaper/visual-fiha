'use strict';
var assign = require('lodash.assign');
var THREE = require('three');
window.THREE = window.THREE || THREE;
require('./OBJLoader');
var ScreenLayerView = require('./../view');







module.exports = ScreenLayerView.types.threejs = ScreenLayerView.extend({
  template: function() {
    return '<div class="layer-threejs" id="' + this.model.getId() + '" view-id="' + this.cid + '"></div>';
  },

  initialize: function() {
    var view = this;
    ScreenLayerView.prototype.initialize.apply(view, arguments);
    window.THREE = window.THREE || THREE;
    window['_threejsView' + view.cid] = view;
    view.on('change:width change:height', view.resize);


    view.listenToAndRun(this, 'change:model.src', function() {
      console.info('threejs layer model src changed', view.model.src);
      if (!view.model.src) return;

      view.objLoader.load(view.model.src, function (object) {
        object.name = 'sceneSubject';
        view.scene.add(object);
      }, function onProgress() {}, function onError() {});
    });
  },

  resize: function() {
    if (!this.renderer) return this;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    return this;
  },

  derived: {
    manager: {
      deps: [],
      fn: function() {
        var manager = new THREE.LoadingManager();
        manager.onProgress = function ( item, loaded, total ) {
          console.log( item, loaded, total );
        };
        return manager;
      }
    },
    objLoader: {
      deps: [],
      fn: function() {
        var view = this;
        var loader = new THREE.OBJLoader(view.manager);
        return loader;
      }
    },
    ambient: {
      deps: [],
      fn: function() {
        return new THREE.AmbientLight( 0x101030 );
      }
    },
    directionalLight: {
      deps: [],
      fn: function() {
        var directionalLight = new THREE.DirectionalLight( 0xffeedd );
        return directionalLight;
      }
    },
    scene: {
      deps: [],
      fn: function() {
        var scene = new THREE.Scene();
        scene.add(this.ambient);
        scene.add(this.directionalLight);
        return scene;
      }
    },
    renderer: {
      deps: ['el'],
      fn: function() {
        if (!this.el) return;
        var renderer = new THREE.WebGLRenderer();
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize(this.width, this.height);
        renderer.setClearColor(0x000000, 1);
        return renderer;
      }
    },
    camera: {
      deps: ['scene'],
      fn: function() {
        if (!this.scene) return;
        var camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 2000);
        camera.lookAt(this.scene.position);
        return camera;
      }
    }
  },

  bindings: assign(ScreenLayerView.prototype.bindings, {

  }),

  render: function() {
    ScreenLayerView.prototype.render.apply(this, arguments);
    this.el.appendChild(this.renderer.domElement);

    var view = this;
    var material = this.material = new THREE.MeshLambertMaterial({color: 0xdddddd, shading: THREE.FlatShading});
    var object = this.object = new THREE.Mesh(new THREE.SphereGeometry(45, 12, 7), material);
    object.name = 'bla';
    view.scene.add(object);

    view.camera.position.set(150, 40, 20);
    view.camera.lookAt(view.scene.position);

    view.directionalLight.position.set(100, 30, 15);
    view.directionalLight.lookAt(view.scene.position);


    object = new THREE.DirectionalLightHelper(view.directionalLight);
    object.name = 'directionalLightHelper';
    view.scene.add(object);

    object = new THREE.AxisHelper(20);
    object.name = 'axisHelper';
    view.scene.add(object);

    object = new THREE.GridHelper(200);
    object.name = 'gridHelper';
    view.scene.add(object);

    this.update();
    return this;
  },

  update: function() {
    var screenState = this.model.screenState;
    var audio = screenState.audio;
    var freq = audio.frequency;
    var vol = audio.timeDomain;

    var bla = this.scene.getObjectByName('bla');
    bla.scale.set(1 + (freq[12] * 0.01), 1 + (freq[24] * 0.01), 1 + (freq[36] * 0.01));

    var directionalLightHelper = this.scene.getObjectByName('directionalLightHelper');
    directionalLightHelper.position.set(this.directionalLight.position);
    directionalLightHelper.lookAt(this.directionalLight.target.position);

    var speed = 1000;
    var dist = 200;
    var deg = (screenState.frametime % (speed * 360) / speed);
    this.camera.position.set(Math.cos(deg) * dist, 40 + (vol[12] * 0.1), Math.sin(deg) * dist);
    this.camera.lookAt(this.scene.position);


    this.renderer.render(this.scene, this.camera);
  }
});