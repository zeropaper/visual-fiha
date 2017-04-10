'use strict';
var assign = require('lodash.assign');
var THREE = require('three');
window.THREE = window.THREE || THREE;
require('./OBJLoader');
var ScreenLayerView = require('./../view');


function compileFunction(func) {
  var fn;

  var evaled = `fn = (function() {
  // override some stuff that should not be used
  var navigator, window, global, document, module, exports;

  return function() {
    var layer = this;
    var width = layer.width || 400;
    var height = layer.height || 300;
    var store = layer.cache = (layer.cache || {});
    var frametime = layer ? layer.frametime : 0;
    var audio = layer ? layer.audio : {};
    var bufferLength = function() { return ((layer.audio || {}).bufferLength) || 128; };
    var frequency = function(x) {
      return ((layer.audio || {}).frequency || [])[x] || 0;
    };
    var timeDomain = function(x) {
      return ((layer.audio || {}).timeDomain || [])[x] || 0;
    };
    var parameter = function (name, deflt) {
      var val = layer.model.parameters.get(name);
      return val ? val.value : deflt;
    };

    return (${ func.toString() })();
  };
})();`;

  eval(evaled);// jshint ignore:line
  return fn;
}

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
  },

  resize: function() {
    if (!this.renderer) return this;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
    return this;
  },

  derived: {
    renderFn: {
      deps: ['model.renderFunction'],
      fn: function() {
        var fn = compileFunction(this.model.renderFunction);
        return fn.bind(this);
      }
    },
    updateFn: {
      deps: ['model.updateFunction'],
      fn: function() {
        var fn = compileFunction(this.model.updateFunction);
        return fn.bind(this);
      }
    },
    manager: {
      deps: [],
      fn: function() {
        var manager = new THREE.LoadingManager();
        // manager.onProgress = function ( item, loaded, total ) {
        //   console.log( item, loaded, total );
        // };
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

    var fn = this.renderFn;
    if (typeof fn === 'function') {
      try {
        fn.call(this);
      }
      catch(up) {
        console.log('renderFunction', up.message);
      }
    }

    this.update();
    return this;
  },

  update: function() {
    var fn = this.updateFn;
    if (typeof fn === 'function') {
      try {
        fn.call(this);
      }
      catch(up) {
        console.log('updateFunction', up.message);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
});