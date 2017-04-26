webpackJsonp([6],{

/***/ 147:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var View = __webpack_require__(35);
var LayerView = __webpack_require__(654);
__webpack_require__(696);
__webpack_require__(703);
__webpack_require__(709);
__webpack_require__(699);
__webpack_require__(676);
__webpack_require__(707);
__webpack_require__(676);


function signature(fn) {
  var args = fn.toString().match('function[^(]*\\(([^)]*)\\)');
  if (!args || !args[1].trim()) { return []; }
  return args[1].split(',').map(function(a){ return a.trim(); });
}

var signatures = {};
function registerCommand(commandName, command) {
  if (arguments.length === 1) {
    if (typeof arguments[0] === 'function') {
      command = arguments[0];
      commandName = command.name;
    }
    else {
      command = commands[arguments[0]];
    }
  }
  else if (typeof command !== 'function') {
    command = commands[commandName];
  }
  signatures[commandName] = signature(command);
}




var commands = {
  bootstrap: function bootstrap(layers) {
    this.model.layers.reset(layers);
    this.model.trigger('app:broadcast:bootstrap', {layers: layers});
    this.resize();
  },
  updateLayer: function(layer) {
    var state = this.model.layers.get(layer.name);
    if (state) {
      state.set(layer);
    }
    else {
      state = this.model.layers.add(layer);
    }
  },
  updateLayers: function(layers, audio) {
    if (audio) this.model.audio = audio;
    this.model.layers.set(layers);
  }
};

Object.keys(commands).forEach(registerCommand);


var clientMixin = {};
clientMixin.initializeClient = function initializeClient() {
  var channel = new window.BroadcastChannel('spike');
  var follower = this;
  var commandArgs;

  channel.addEventListener('message', function(evt) {
    var commandName = evt.data.command;
    var command = commands[commandName];

    if (typeof command !== 'function') {
      return;
    }

    if (!signatures[commandName]) {
      return;
    }

    commandArgs = signatures[commandName].map(function(argName) {
      if (argName === 'timeStamp') return evt.timeStamp;
      return evt.data.payload[argName];
    });

    command.apply(follower, commandArgs);
  });

  this.channel = channel;
};













var ScreenView = View.extend(clientMixin, {
  autoRender: true,

  template: '<div class="screen"></div>',

  session: {
    width: ['number', true, 400],
    height: ['number', true, 300],
    captureMouse: ['boolean', true, false],
    captureDebug: ['boolean', true, false]
  },

  initialize: function () {
    if (!this.model) {
      throw new Error('Missing model option for ScreenView');
    }
    this.initializeClient();
  },

  derived: {
    styleEl: {
      deps: ['el'],
      fn: function() {
        var el = document.getElementById('vf-screen-styles');
        if (!el) {
          el = document.createElement('style');
          el.id = 'vf-screen-styles';
          el.appendChild(document.createTextNode(''));
          document.head.appendChild(el);
        }
        return el;
      }
    },
    sheet: {
      deps: ['styleEl'],
      fn: function() {
        return this.styleEl.sheet;
      }
    },
    cssRule: {
      deps: ['sheet'],
      fn: function() {
        if (this.sheet.cssRules.length === 0) {
          this.addRule('', 'opacity:1');
        }
        return this.sheet.cssRules[0];
      }
    }
  },

  addRule: function(selector, properties) {
    var sheet = this.sheet;
    this.el.id = this.el.id || 'vf-screen-' + this.cid;
    var prefix = '#'+ this.el.id +' ';
    var index = sheet.cssRules.length;
    selector = (prefix + selector).trim();
    for (var i = index - 1; i >= 0; i--) {
      if (sheet.cssRules[i].selectorText === selector) {
        sheet.deleteRule(i);
      }
    }


    index = sheet.cssRules.length;

    sheet.insertRule(selector + ' { ' + properties + ' } ', index);
    return this;
  },

  setProperty: function(...args) {
    this.cssRule.style.setProperty(...args);
  },

  remove: function() {
    if (this.channel) {
      this.channel.close();
    }
    return View.prototype.remove.apply(this, arguments);
  },

  resize: function () {
    if (!this.el) { return this; }
    this.setProperty('position', 'fixed');
    this.setProperty('top', 0);
    this.setProperty('left', 0);
    this.setProperty('width', '100%');
    this.setProperty('height', '100%');
    if (!this.el || !this.el.parentNode || !document.body.contains(this.el)) {
      return this;
    }
    this.width = this.el.clientWidth;
    this.height = this.el.clientHeight;
    return this._resizeLayers();
  },

  _resizeLayers: function() {
    if (!this.layersView || !this.layersView.views) { return this; }
    var w = this.width;
    var h = this.height;

    this.layersView.views.forEach(function(view) {
      view.width = w;
      view.height = h;
    });
    return this;
  },

  render: function() {
    if (!this.el) {
      this.renderWithTemplate();
    }

    if (!this.layersView) {
      this.layersView = this.renderCollection(this.model.layers, function(opts) {
        var type = opts.model.getType();
        var ScreenLayerConstructor = LayerView.types[type] || LayerView;
        return new ScreenLayerConstructor(opts);
      }, this.el, {parent: this});
      this._updateLayers();
    }

    if (!this._ar) {
      this._animate();
    }

    return this.resize();
  },

  update: function(options) {
    if (!this.layersView) {
      return this.render().update(options);
    }

    this.model.set(options);

    return this;
  },

  _ar: null,
  _animate: function(timestamp) {
    this.model.frametime = timestamp || 0;
    this._updateLayers();
    this._ar = window.requestAnimationFrame(this._animate.bind(this));
  },

  _updateLayers: function() {
    this.setProperty('--frametime', this.model.frametime);

    var audio = this.model.audio;
    if (audio && audio.frequency && audio.timeDomain) {
      var length = audio.frequency.length;
      var l, li = 0, af = 0, av = 0, ll = length / 16;

      for (l = 0; l < length; l += ll) {
        li++;
        af += audio.frequency[l];
        av += audio.timeDomain[l];
        this.setProperty('--freq' + li, audio.frequency[l]);
        this.setProperty('--vol' + li, audio.timeDomain[l]);
      }
      this.setProperty('--freqAvg', af / length);
      this.setProperty('--volAvg', av / length);
    }

    this.layersView.views.forEach(function(subview) {
      if (subview.model.active) subview.update();
    });
  }
});
module.exports = ScreenView;

/***/ }),

/***/ 654:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var View = __webpack_require__(35);

var LayerView = View.extend({
  template: function() {
    return `
      <div id="${this.model.getId()}" view-id="${this.cid}" class="missing-layer-view" style="will-change:transform, opacity, backfaceVisibility;width:100%;height:100%;display:table">
        <div style="display:table-cell;color:#a66;vertical-align:middle;text-align:center;font-weight:700;font-size:30px;text-shadow:0 0 4px #000">
          Missing
          <span data-hook="type"></span> for
          <span data-hook="name"></span>
          layer view
          <br/>
          <span data-hook="frametime"></span>
        </div>
      </div>
    `;
  },

  initialize: function() {
    this.listenTo(this.model.styleProperties, 'change', function(prop) {
      this.setProperty(prop.name, prop.value);
    });
  },

  derived: {
    styleEl: {
      deps: [],
      fn: function() {
        var id = this.model.getId();
        var el = document.getElementById('style-' + id);
        if (!el) {
          el = document.createElement('style');
          el.id = 'style-' + id;
          el.appendChild(document.createTextNode(''));
          document.head.appendChild(el);
        }
        return el;
      }
    },
    sheet: {
      deps: ['styleEl'],
      fn: function() {
        return this.styleEl.sheet;
      }
    },
    cssRule: {
      deps: ['sheet', 'model.layerStyles'],
      fn: function() {
        if (this.sheet.cssRules.length === 0) {
          this.addRule('', this.model.layerStyles);
        }
        return this.sheet.cssRules[0];
      }
    },
    layerStyleObj: {
      deps: ['model', 'model.layerStyles'],
      fn: function() {
        var exp = /[\s]*([^:]+)[\s]*:[\s]*([^;]+)[\s]*;[\s]*/gim;
        return ((this.model.layerStyles || '').match(exp) || [])
          .map(s => s
            .trim()
            .split(':')
              .map(ss => ss
                .replace(';', '')
                .trim()));
      }
    }
  },

  session: {
    width: ['number', true, 400],
    height: ['number', true, 300]
  },

  bindings: {
    'model.type': '[data-hook=type]',
    'model.name': '[data-hook=name]',
    'model.active': {type: 'toggle'},
    'model.layerStyles': {
      type: function() {
        var style = this.cssRule.style;
        this.layerStyleObj.forEach(function(arr) {
          style[arr[0]] = arr[1];
        });
      }
    },
    'model.opacity': {
      type: function(el, val) {
        this.cssRule.style.opacity = val * 0.01;
      }
    },
    'model.zIndex': {
      type: function(el, val) {
        this.cssRule.style.zIndex = val;
      }
    }
  },

  setProperty: function(...args) {
    this.cssRule.style.setProperty(...args);
  },

  addRule: function(selector, properties) {
    var sheet = this.sheet;
    var prefix = '#'+ this.model.getId() +' ';
    var index = sheet.cssRules.length;
    selector = (selector.indexOf('@') === 0 ? selector : prefix + selector).trim();
    for (var i = index - 1; i >= 0; i--) {
      if (sheet.cssRules[i].selectorText === selector) {
        sheet.deleteRule(i);
      }
    }


    index = sheet.cssRules.length;

    sheet.insertRule(selector + ' { ' + properties + ' } ', index);
    return this;
  },

  remove: function() {
    // they are some issues with bootstraping a new setup if the element is removed
    // var styleEl = this.styleEl;
    // if (styleEl && styleEl.parentNode) {
    //   styleEl.parentNode.removeChild(styleEl);
    // }
    return View.prototype.remove.apply(this, arguments);
  },

  update: function() {}
});
LayerView.types = {};
module.exports = LayerView;

/***/ }),

/***/ 676:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// var assign = require('lodash.assign');
var ScreenLayerView = __webpack_require__(654);

var THREE = __webpack_require__(95);
window.THREE = window.THREE || THREE;

// require('three/examples/js/loaders/DDSLoader');
// THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
__webpack_require__(682);
__webpack_require__(683);


var midiMinMax = __webpack_require__(658);
var midi2Rad = __webpack_require__(660);
var midi2Prct = __webpack_require__(659);


function noop() {}

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

    var getLoaderViewByName = function(name) {
      var filtered = layer.loaders.views.filter(v => v.model.name === name);
      return filtered.length ? filtered[0] : false;
    };

    var bufferLength = function() {
      return ((layer.audio || {}).bufferLength) || 128;
    };

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

    ${ midiMinMax.toString() }
    ${ midi2Rad.toString() }
    ${ midi2Prct.toString() }

    return (${ func.toString() })();
  };
})();`;

  eval(evaled);// jshint ignore:line
  return fn;
}

function bindObjectChange(source, destination, keys = ['x', 'y', 'z']) {
  keys.forEach(function(key) {
    source.on('change:' + key, function() {
      destination[key] = source[key];
    });
  });
}

function bindObjectChanges(model, object) {
  if (object.position) bindObjectChange(model.position, object.position);
  if (object.rotation) bindObjectChange(model.rotation, object.rotation);
  if (object.scale) bindObjectChange(model.scale, object.scale);
  if (object.material && object.material.color && model.material && model.material.color) {
    bindObjectChange(model.material.color, object.material.color, ['r', 'g', 'b']);
  }
}

function makeThreeObjectInstance(model) {
  var Constructor = THREE[model.threeClassName];
  if (!Constructor) {
    return;
  }

  var args = (model.signature || []).map(function(name) {
    return model.get(name);
  });
  var object = new Constructor(...args);

  if (!object.isGeometry) {
    bindObjectChanges(model, object);
    object.name = model.name;
    return object;
  }

  var materialOptions = {
    color: 0x00ff00
  };

  var materialClassName = 'MeshLambertMaterial';
  if (model.material) {
    if (model.material.color) {
      var color = model.material.color;
      materialOptions.color = new THREE.Color(color.r, color.g, color.b);
    }
  }

  var material = new THREE[materialClassName](materialOptions);
  var meshObject = new THREE.Mesh(object, material);
  meshObject.name = model.name;
  bindObjectChanges(model, meshObject);
  return meshObject;
}

var State = __webpack_require__(27);

var ThreeObject = State.extend({
  session: {
    model: ['state', true, null]
  },

  derived: {
    object: {
      deps: ['model'],
      fn: function() {
        var model = this.model;
        var object = this.scene.getObjectByName(model.name);

        if (object) {
          return;
        }
        return makeThreeObjectInstance(model);
      }
    },
    scene: {
      deps: ['parent'],
      fn: function() {
        return this.parent.scene;
      }
    }
  },

  render: function() {
    // that sucks... but i don't want to duck punch the renderCollection function
    this.el = document.createElement('div');
    this.el.style.display = 'none';

    var object = this.object;
    if (object) this.scene.add(object);
    return this;
  },

  remove: function() {
    var object = this.object;
    if (object) object.remove();
    if (State.prototype.remove) State.prototype.remove.apply(this, arguments);
    return this;
  }
});





// function loaderProgress(what) {
//   return function progress(xhr) {
//     if (xhr.lengthComputable) {
//       console.info('%s %s% loaded', what, (xhr.loaded / xhr.total * 100).toFixed(2));
//     }
//   };
// }
var ThreeLoader = ThreeObject.extend({
  session: {
    loading: ['boolean', true, false],
    loaded: ['any', false, null]
  },

  derived: {
    object: {
      deps: ['loaded'],
      fn: function() {
        return this.loaded;
      }
    },
    manager: {
      deps: ['parent'],
      fn: function() {
        return this.parent.manager;
      }
    }
  },

  addObj: function() {
    var obj = this.object;
    this.scene.add(obj);
    return this;
  },

  initialize: function() {
    ThreeObject.prototype.initialize.apply(this, arguments);
    var view = this;

    view.on('change:object', function() {
      var prev = view.previousAttributes();
      if (prev.object) {
        prev.object.remove();
      }
      var obj = view.object;

      var model = view.model;
      if (model.material) {
        if (model.material.color && obj.material) {
          var color = model.material.color;
          obj.material.color.setRGB(color.r, color.g, color.b);
        }
      }

      view.addObj();
    });

    view.listenToAndRun(view.model, 'change:src change:path', function() {
      if (!view.model.src || view.loading) return;

      view.loading = true;
      view.load(function() {
        view.loading = false;
      }, noop, function() {
        view.loading = false;
      });
    });
  },

  load: function(done = noop, progress = noop, error = noop) {
    console.info('stub load', done, progress, error);
  },

  render: function() {
    // that sucks... but i don't want to duck punch the renderCollection function
    this.el = document.createElement('div');
    this.el.style.display = 'none';

    return this;
  },

  remove: function() {
    ThreeObject.prototype.remove.apply(this, arguments);
    return this;
  }
});


function applyTransformations(model, object) {
  var s = model.scale;
  var r = model.rotation;
  var p = model.position;
  object.scale.set(s.x, s.y, s.z);
  object.rotation.set(r.x, r.y, r.z);
  object.position.set(p.x, p.y, p.z);
}

ThreeLoader.types = {};
ThreeLoader.types.obj = ThreeLoader.extend({
  load: function(done, progress = noop, error = noop) {
    var view = this;
    var model = this.model;

    var objLoader = new THREE.OBJLoader();
    objLoader.setPath(model.path);

    function objLoaded(object) {
      object.name = model.name;
      view.loaded = object;
      applyTransformations(model, object);
      done();
    }

    objLoader.load(model.src, objLoaded, progress, error);
  }
});



ThreeLoader.types.objmtl = ThreeLoader.extend({
  derived: {
    object: {
      deps: ['loaded'],
      fn: function() {
        return this.loaded ? this.loaded.object : false;
      }
    }
  },

  addObj: function() {
    var obj = this.object;
    this.scene.add(obj);
    return this;
  },

  load: function(done, progress = noop, error = noop) {
    var view = this;
    var model = this.model;

    var objLoader = new THREE.OBJLoader();
    objLoader.setPath(model.path);

    function objLoaded(object) {
      object.name = model.name;
      view.set('loaded', {object: object, materials: view.loaded.materials}, {silent: false, trigger: true});
      applyTransformations(model, object);
      done();
    }

    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath(model.path);

    function mtlLoaded(materials) {
      materials.preload();
      objLoader.setMaterials(materials);
      view.set('loaded', {materials: materials, object: null}, {silent: true});
      objLoader.load(model.src, objLoaded, progress, error);
    }

    mtlLoader.load(model.mtl, mtlLoaded, progress, error);
  }
});



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
    view.on('change:model.renderFunction', function() {
      view._cleanupScene()._renderScene();
    });
  },

  resize: function() {
    if (!this.renderer || !this.camera) return this;
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
        return new THREE.LoadingManager();
      }
    },
    scene: {
      deps: [],
      fn: function() {
        return new THREE.Scene();
      }
    },
    renderer: {
      deps: ['el'],
      fn: function() {
        if (!this.el) return;
        var renderer = new THREE.WebGLRenderer({alpha: true});
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(this.width, this.height);
        renderer.setClearColor(0x000000, 0);
        return renderer;
      }
    },
    camera: {
      deps: ['scene', 'model.currentCamera', 'model.cameras'],
      fn: function() {
        if (!this.scene) return;
        var model = this.model;
        var info = model.currentCamera ?
                    model.cameras.get(model.currentCamera) :
                    model.cameras.at(0);

        if (!info) {
          info = {
            name: 'defaultCamera',
            fov: 45,
            near: 1,
            far: 2000,
            position: {
              x: 45,
              y: 45,
              z: 45
            },
            lookAt: {
              x: 0,
              y: 0,
              z: 0
            }
          };
        }

        var camera = this.scene.getObjectByName(info.name);
        if (!camera) {
          camera = new THREE.PerspectiveCamera(info.fov, this.width / this.height, info.near, info.far);
          camera.name = info.name;
        }
        else {
          camera.fov = info.fov;
          camera.aspect = this.width / this.height;
          camera.near = info.near;
          camera.far = info.far;
        }

        camera.lookAt(info.lookAt.x, info.lookAt.y, info.lookAt.z);

        return camera;
      }
    }
  },

  _cleanupScene: function() {
    var scene = this.scene;

    function empty(elem) {
      if (elem) {
        while (elem.lastChild) elem.removeChild(elem.lastChild);
      }
    }

    cancelAnimationFrame(scene.id);// Stop the animation
    this.renderer.domElement.addEventListener('dblclick', null, false); //remove listener to render
    scene.scene = null;
    scene.projector = null;
    scene.camera = null;
    scene.controls = null;
    empty(scene.modelContainer);

    try {
      this.el.removeChild(this.renderer.domElement);
    } catch(up) {}

    delete this._cache.renderer;
    delete this._cache.camera;
    delete this._cache.scene;

    return this;
  },

  _renderScene: function() {
    var view = this;
    var fn = view.renderFn;

    view.el.appendChild(view.renderer.domElement);

    [
      'geometries',
      'cameras',
      'lights'
    ].forEach(function(collectionName) {
      view[collectionName] = view[collectionName] || view.renderCollection(view.model[collectionName], function(options) {
        return new ThreeObject({model: options.model}, {parent: view});
      });
    });

    view.loaders = view.loaders || view.renderCollection(view.model.loaders, function(options) {
      var Constructor = ThreeLoader.types[options.model.type] || ThreeLoader;
      return new Constructor({model: options.model}, {parent: view});
    });


    if (typeof fn === 'function') {
      try {
        fn.call(view);
      }
      catch(up) {
        console.log('renderFunction', up.message);
      }
    }

    return view;
  },

  render: function() {
    ScreenLayerView.prototype.render.apply(this, arguments);

    this._renderScene();

    this.update();
    return this;
  },

  update: function() {
    if (!this.camera) return;

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
  },

  remove: function() {
    this._cleanupScene();
    ScreenLayerView.prototype.remove.apply(this, arguments);
  }
});

/***/ }),

/***/ 682:
/***/ (function(module, exports) {

/**
 * Loads a Wavefront .mtl file specifying materials
 *
 * @author angelxuanchang
 */

THREE.MTLLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.MTLLoader.prototype = {

	constructor: THREE.MTLLoader,

	/**
	 * Loads and parses a MTL asset from a URL.
	 *
	 * @param {String} url - URL to the MTL file.
	 * @param {Function} [onLoad] - Callback invoked with the loaded object.
	 * @param {Function} [onProgress] - Callback for download progress.
	 * @param {Function} [onError] - Callback for download errors.
	 *
	 * @see setPath setTexturePath
	 *
	 * @note In order for relative texture references to resolve correctly
	 * you must call setPath and/or setTexturePath explicitly prior to load.
	 */
	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.FileLoader( this.manager );
		loader.setPath( this.path );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	/**
	 * Set base path for resolving references.
	 * If set this path will be prepended to each loaded and found reference.
	 *
	 * @see setTexturePath
	 * @param {String} path
	 *
	 * @example
	 *     mtlLoader.setPath( 'assets/obj/' );
	 *     mtlLoader.load( 'my.mtl', ... );
	 */
	setPath: function ( path ) {

		this.path = path;

	},

	/**
	 * Set base path for resolving texture references.
	 * If set this path will be prepended found texture reference.
	 * If not set and setPath is, it will be used as texture base path.
	 *
	 * @see setPath
	 * @param {String} path
	 *
	 * @example
	 *     mtlLoader.setPath( 'assets/obj/' );
	 *     mtlLoader.setTexturePath( 'assets/textures/' );
	 *     mtlLoader.load( 'my.mtl', ... );
	 */
	setTexturePath: function ( path ) {

		this.texturePath = path;

	},

	setBaseUrl: function ( path ) {

		console.warn( 'THREE.MTLLoader: .setBaseUrl() is deprecated. Use .setTexturePath( path ) for texture path or .setPath( path ) for general base path instead.' );

		this.setTexturePath( path );

	},

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	setMaterialOptions: function ( value ) {

		this.materialOptions = value;

	},

	/**
	 * Parses a MTL file.
	 *
	 * @param {String} text - Content of MTL file
	 * @return {THREE.MTLLoader.MaterialCreator}
	 *
	 * @see setPath setTexturePath
	 *
	 * @note In order for relative texture references to resolve correctly
	 * you must call setPath and/or setTexturePath explicitly prior to parse.
	 */
	parse: function ( text ) {

		var lines = text.split( '\n' );
		var info = {};
		var delimiter_pattern = /\s+/;
		var materialsInfo = {};

		for ( var i = 0; i < lines.length; i ++ ) {

			var line = lines[ i ];
			line = line.trim();

			if ( line.length === 0 || line.charAt( 0 ) === '#' ) {

				// Blank line or comment ignore
				continue;

			}

			var pos = line.indexOf( ' ' );

			var key = ( pos >= 0 ) ? line.substring( 0, pos ) : line;
			key = key.toLowerCase();

			var value = ( pos >= 0 ) ? line.substring( pos + 1 ) : '';
			value = value.trim();

			if ( key === 'newmtl' ) {

				// New material

				info = { name: value };
				materialsInfo[ value ] = info;

			} else if ( info ) {

				if ( key === 'ka' || key === 'kd' || key === 'ks' ) {

					var ss = value.split( delimiter_pattern, 3 );
					info[ key ] = [ parseFloat( ss[ 0 ] ), parseFloat( ss[ 1 ] ), parseFloat( ss[ 2 ] ) ];

				} else {

					info[ key ] = value;

				}

			}

		}

		var materialCreator = new THREE.MTLLoader.MaterialCreator( this.texturePath || this.path, this.materialOptions );
		materialCreator.setCrossOrigin( this.crossOrigin );
		materialCreator.setManager( this.manager );
		materialCreator.setMaterials( materialsInfo );
		return materialCreator;

	}

};

/**
 * Create a new THREE-MTLLoader.MaterialCreator
 * @param baseUrl - Url relative to which textures are loaded
 * @param options - Set of options on how to construct the materials
 *                  side: Which side to apply the material
 *                        THREE.FrontSide (default), THREE.BackSide, THREE.DoubleSide
 *                  wrap: What type of wrapping to apply for textures
 *                        THREE.RepeatWrapping (default), THREE.ClampToEdgeWrapping, THREE.MirroredRepeatWrapping
 *                  normalizeRGB: RGBs need to be normalized to 0-1 from 0-255
 *                                Default: false, assumed to be already normalized
 *                  ignoreZeroRGBs: Ignore values of RGBs (Ka,Kd,Ks) that are all 0's
 *                                  Default: false
 * @constructor
 */

THREE.MTLLoader.MaterialCreator = function ( baseUrl, options ) {

	this.baseUrl = baseUrl || '';
	this.options = options;
	this.materialsInfo = {};
	this.materials = {};
	this.materialsArray = [];
	this.nameLookup = {};

	this.side = ( this.options && this.options.side ) ? this.options.side : THREE.FrontSide;
	this.wrap = ( this.options && this.options.wrap ) ? this.options.wrap : THREE.RepeatWrapping;

};

THREE.MTLLoader.MaterialCreator.prototype = {

	constructor: THREE.MTLLoader.MaterialCreator,

	setCrossOrigin: function ( value ) {

		this.crossOrigin = value;

	},

	setManager: function ( value ) {

		this.manager = value;

	},

	setMaterials: function ( materialsInfo ) {

		this.materialsInfo = this.convert( materialsInfo );
		this.materials = {};
		this.materialsArray = [];
		this.nameLookup = {};

	},

	convert: function ( materialsInfo ) {

		if ( ! this.options ) return materialsInfo;

		var converted = {};

		for ( var mn in materialsInfo ) {

			// Convert materials info into normalized form based on options

			var mat = materialsInfo[ mn ];

			var covmat = {};

			converted[ mn ] = covmat;

			for ( var prop in mat ) {

				var save = true;
				var value = mat[ prop ];
				var lprop = prop.toLowerCase();

				switch ( lprop ) {

					case 'kd':
					case 'ka':
					case 'ks':

						// Diffuse color (color under white light) using RGB values

						if ( this.options && this.options.normalizeRGB ) {

							value = [ value[ 0 ] / 255, value[ 1 ] / 255, value[ 2 ] / 255 ];

						}

						if ( this.options && this.options.ignoreZeroRGBs ) {

							if ( value[ 0 ] === 0 && value[ 1 ] === 0 && value[ 2 ] === 0 ) {

								// ignore

								save = false;

							}

						}

						break;

					default:

						break;

				}

				if ( save ) {

					covmat[ lprop ] = value;

				}

			}

		}

		return converted;

	},

	preload: function () {

		for ( var mn in this.materialsInfo ) {

			this.create( mn );

		}

	},

	getIndex: function ( materialName ) {

		return this.nameLookup[ materialName ];

	},

	getAsArray: function () {

		var index = 0;

		for ( var mn in this.materialsInfo ) {

			this.materialsArray[ index ] = this.create( mn );
			this.nameLookup[ mn ] = index;
			index ++;

		}

		return this.materialsArray;

	},

	create: function ( materialName ) {

		if ( this.materials[ materialName ] === undefined ) {

			this.createMaterial_( materialName );

		}

		return this.materials[ materialName ];

	},

	createMaterial_: function ( materialName ) {

		// Create material

		var scope = this;
		var mat = this.materialsInfo[ materialName ];
		var params = {

			name: materialName,
			side: this.side

		};

		function resolveURL( baseUrl, url ) {

			if ( typeof url !== 'string' || url === '' )
				return '';

			// Absolute URL
			if ( /^https?:\/\//i.test( url ) ) return url;

			return baseUrl + url;

		}

		function setMapForType( mapType, value ) {

			if ( params[ mapType ] ) return; // Keep the first encountered texture

			var texParams = scope.getTextureParams( value, params );
			var map = scope.loadTexture( resolveURL( scope.baseUrl, texParams.url ) );

			map.repeat.copy( texParams.scale );
			map.offset.copy( texParams.offset );

			map.wrapS = scope.wrap;
			map.wrapT = scope.wrap;

			params[ mapType ] = map;

		}

		for ( var prop in mat ) {

			var value = mat[ prop ];

			if ( value === '' ) continue;

			switch ( prop.toLowerCase() ) {

				// Ns is material specular exponent

				case 'kd':

					// Diffuse color (color under white light) using RGB values

					params.color = new THREE.Color().fromArray( value );

					break;

				case 'ks':

					// Specular color (color when light is reflected from shiny surface) using RGB values
					params.specular = new THREE.Color().fromArray( value );

					break;

				case 'map_kd':

					// Diffuse texture map

					setMapForType( "map", value );

					break;

				case 'map_ks':

					// Specular map

					setMapForType( "specularMap", value );

					break;

				case 'map_bump':
				case 'bump':

					// Bump texture map

					setMapForType( "bumpMap", value );

					break;

				case 'ns':

					// The specular exponent (defines the focus of the specular highlight)
					// A high exponent results in a tight, concentrated highlight. Ns values normally range from 0 to 1000.

					params.shininess = parseFloat( value );

					break;

				case 'd':

					if ( value < 1 ) {

						params.opacity = value;
						params.transparent = true;

					}

					break;

				case 'Tr':

					if ( value > 0 ) {

						params.opacity = 1 - value;
						params.transparent = true;

					}

					break;

				default:
					break;

			}

		}

		this.materials[ materialName ] = new THREE.MeshPhongMaterial( params );
		return this.materials[ materialName ];

	},

	getTextureParams: function ( value, matParams ) {

		var texParams = {

			scale: new THREE.Vector2( 1, 1 ),
			offset: new THREE.Vector2( 0, 0 )

		 };

		var items = value.split( /\s+/ );
		var pos;

		pos = items.indexOf( '-bm' );

		if ( pos >= 0 ) {

			matParams.bumpScale = parseFloat( items[ pos + 1 ] );
			items.splice( pos, 2 );

		}

		pos = items.indexOf( '-s' );

		if ( pos >= 0 ) {

			texParams.scale.set( parseFloat( items[ pos + 1 ] ), parseFloat( items[ pos + 2 ] ) );
			items.splice( pos, 4 ); // we expect 3 parameters here!

		}

		pos = items.indexOf( '-o' );

		if ( pos >= 0 ) {

			texParams.offset.set( parseFloat( items[ pos + 1 ] ), parseFloat( items[ pos + 2 ] ) );
			items.splice( pos, 4 ); // we expect 3 parameters here!

		}

		texParams.url = items.join( ' ' ).trim();
		return texParams;

	},

	loadTexture: function ( url, mapping, onLoad, onProgress, onError ) {

		var texture;
		var loader = THREE.Loader.Handlers.get( url );
		var manager = ( this.manager !== undefined ) ? this.manager : THREE.DefaultLoadingManager;

		if ( loader === null ) {

			loader = new THREE.TextureLoader( manager );

		}

		if ( loader.setCrossOrigin ) loader.setCrossOrigin( this.crossOrigin );
		texture = loader.load( url, onLoad, onProgress, onError );

		if ( mapping !== undefined ) texture.mapping = mapping;

		return texture;

	}

};


/***/ }),

/***/ 683:
/***/ (function(module, exports) {

/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.OBJLoader = function ( manager ) {

	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

	this.materials = null;

	this.regexp = {
		// v float float float
		vertex_pattern           : /^v\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
		// vn float float float
		normal_pattern           : /^vn\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
		// vt float float
		uv_pattern               : /^vt\s+([\d|\.|\+|\-|e|E]+)\s+([\d|\.|\+|\-|e|E]+)/,
		// f vertex vertex vertex
		face_vertex              : /^f\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)(?:\s+(-?\d+))?/,
		// f vertex/uv vertex/uv vertex/uv
		face_vertex_uv           : /^f\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+))?/,
		// f vertex/uv/normal vertex/uv/normal vertex/uv/normal
		face_vertex_uv_normal    : /^f\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)\s+(-?\d+)\/(-?\d+)\/(-?\d+)(?:\s+(-?\d+)\/(-?\d+)\/(-?\d+))?/,
		// f vertex//normal vertex//normal vertex//normal
		face_vertex_normal       : /^f\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)\s+(-?\d+)\/\/(-?\d+)(?:\s+(-?\d+)\/\/(-?\d+))?/,
		// o object_name | g group_name
		object_pattern           : /^[og]\s*(.+)?/,
		// s boolean
		smoothing_pattern        : /^s\s+(\d+|on|off)/,
		// mtllib file_reference
		material_library_pattern : /^mtllib /,
		// usemtl material_name
		material_use_pattern     : /^usemtl /
	};

};

THREE.OBJLoader.prototype = {

	constructor: THREE.OBJLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var scope = this;

		var loader = new THREE.FileLoader( scope.manager );
		loader.setPath( this.path );
		loader.load( url, function ( text ) {

			onLoad( scope.parse( text ) );

		}, onProgress, onError );

	},

	setPath: function ( value ) {

		this.path = value;

	},

	setMaterials: function ( materials ) {

		this.materials = materials;

	},

	_createParserState : function () {

		var state = {
			objects  : [],
			object   : {},

			vertices : [],
			normals  : [],
			uvs      : [],

			materialLibraries : [],

			startObject: function ( name, fromDeclaration ) {

				// If the current object (initial from reset) is not from a g/o declaration in the parsed
				// file. We need to use it for the first parsed g/o to keep things in sync.
				if ( this.object && this.object.fromDeclaration === false ) {

					this.object.name = name;
					this.object.fromDeclaration = ( fromDeclaration !== false );
					return;

				}

				var previousMaterial = ( this.object && typeof this.object.currentMaterial === 'function' ? this.object.currentMaterial() : undefined );

				if ( this.object && typeof this.object._finalize === 'function' ) {

					this.object._finalize( true );

				}

				this.object = {
					name : name || '',
					fromDeclaration : ( fromDeclaration !== false ),

					geometry : {
						vertices : [],
						normals  : [],
						uvs      : []
					},
					materials : [],
					smooth : true,

					startMaterial : function( name, libraries ) {

						var previous = this._finalize( false );

						// New usemtl declaration overwrites an inherited material, except if faces were declared
						// after the material, then it must be preserved for proper MultiMaterial continuation.
						if ( previous && ( previous.inherited || previous.groupCount <= 0 ) ) {

							this.materials.splice( previous.index, 1 );

						}

						var material = {
							index      : this.materials.length,
							name       : name || '',
							mtllib     : ( Array.isArray( libraries ) && libraries.length > 0 ? libraries[ libraries.length - 1 ] : '' ),
							smooth     : ( previous !== undefined ? previous.smooth : this.smooth ),
							groupStart : ( previous !== undefined ? previous.groupEnd : 0 ),
							groupEnd   : -1,
							groupCount : -1,
							inherited  : false,

							clone : function( index ) {
								var cloned = {
									index      : ( typeof index === 'number' ? index : this.index ),
									name       : this.name,
									mtllib     : this.mtllib,
									smooth     : this.smooth,
									groupStart : 0,
									groupEnd   : -1,
									groupCount : -1,
									inherited  : false
								};
								cloned.clone = this.clone.bind(cloned);
								return cloned;
							}
						};

						this.materials.push( material );

						return material;

					},

					currentMaterial : function() {

						if ( this.materials.length > 0 ) {
							return this.materials[ this.materials.length - 1 ];
						}

						return undefined;

					},

					_finalize : function( end ) {

						var lastMultiMaterial = this.currentMaterial();
						if ( lastMultiMaterial && lastMultiMaterial.groupEnd === -1 ) {

							lastMultiMaterial.groupEnd = this.geometry.vertices.length / 3;
							lastMultiMaterial.groupCount = lastMultiMaterial.groupEnd - lastMultiMaterial.groupStart;
							lastMultiMaterial.inherited = false;

						}

						// Ignore objects tail materials if no face declarations followed them before a new o/g started.
						if ( end && this.materials.length > 1 ) {

							for ( var mi = this.materials.length - 1; mi >= 0; mi-- ) {
								if ( this.materials[mi].groupCount <= 0 ) {
									this.materials.splice( mi, 1 );
								}
							}

						}

						// Guarantee at least one empty material, this makes the creation later more straight forward.
						if ( end && this.materials.length === 0 ) {

							this.materials.push({
								name   : '',
								smooth : this.smooth
							});

						}

						return lastMultiMaterial;

					}
				};

				// Inherit previous objects material.
				// Spec tells us that a declared material must be set to all objects until a new material is declared.
				// If a usemtl declaration is encountered while this new object is being parsed, it will
				// overwrite the inherited material. Exception being that there was already face declarations
				// to the inherited material, then it will be preserved for proper MultiMaterial continuation.

				if ( previousMaterial && previousMaterial.name && typeof previousMaterial.clone === "function" ) {

					var declared = previousMaterial.clone( 0 );
					declared.inherited = true;
					this.object.materials.push( declared );

				}

				this.objects.push( this.object );

			},

			finalize : function() {

				if ( this.object && typeof this.object._finalize === 'function' ) {

					this.object._finalize( true );

				}

			},

			parseVertexIndex: function ( value, len ) {

				var index = parseInt( value, 10 );
				return ( index >= 0 ? index - 1 : index + len / 3 ) * 3;

			},

			parseNormalIndex: function ( value, len ) {

				var index = parseInt( value, 10 );
				return ( index >= 0 ? index - 1 : index + len / 3 ) * 3;

			},

			parseUVIndex: function ( value, len ) {

				var index = parseInt( value, 10 );
				return ( index >= 0 ? index - 1 : index + len / 2 ) * 2;

			},

			addVertex: function ( a, b, c ) {

				var src = this.vertices;
				var dst = this.object.geometry.vertices;

				dst.push( src[ a + 0 ] );
				dst.push( src[ a + 1 ] );
				dst.push( src[ a + 2 ] );
				dst.push( src[ b + 0 ] );
				dst.push( src[ b + 1 ] );
				dst.push( src[ b + 2 ] );
				dst.push( src[ c + 0 ] );
				dst.push( src[ c + 1 ] );
				dst.push( src[ c + 2 ] );

			},

			addVertexLine: function ( a ) {

				var src = this.vertices;
				var dst = this.object.geometry.vertices;

				dst.push( src[ a + 0 ] );
				dst.push( src[ a + 1 ] );
				dst.push( src[ a + 2 ] );

			},

			addNormal : function ( a, b, c ) {

				var src = this.normals;
				var dst = this.object.geometry.normals;

				dst.push( src[ a + 0 ] );
				dst.push( src[ a + 1 ] );
				dst.push( src[ a + 2 ] );
				dst.push( src[ b + 0 ] );
				dst.push( src[ b + 1 ] );
				dst.push( src[ b + 2 ] );
				dst.push( src[ c + 0 ] );
				dst.push( src[ c + 1 ] );
				dst.push( src[ c + 2 ] );

			},

			addUV: function ( a, b, c ) {

				var src = this.uvs;
				var dst = this.object.geometry.uvs;

				dst.push( src[ a + 0 ] );
				dst.push( src[ a + 1 ] );
				dst.push( src[ b + 0 ] );
				dst.push( src[ b + 1 ] );
				dst.push( src[ c + 0 ] );
				dst.push( src[ c + 1 ] );

			},

			addUVLine: function ( a ) {

				var src = this.uvs;
				var dst = this.object.geometry.uvs;

				dst.push( src[ a + 0 ] );
				dst.push( src[ a + 1 ] );

			},

			addFace: function ( a, b, c, d, ua, ub, uc, ud, na, nb, nc, nd ) {

				var vLen = this.vertices.length;

				var ia = this.parseVertexIndex( a, vLen );
				var ib = this.parseVertexIndex( b, vLen );
				var ic = this.parseVertexIndex( c, vLen );
				var id;

				if ( d === undefined ) {

					this.addVertex( ia, ib, ic );

				} else {

					id = this.parseVertexIndex( d, vLen );

					this.addVertex( ia, ib, id );
					this.addVertex( ib, ic, id );

				}

				if ( ua !== undefined ) {

					var uvLen = this.uvs.length;

					ia = this.parseUVIndex( ua, uvLen );
					ib = this.parseUVIndex( ub, uvLen );
					ic = this.parseUVIndex( uc, uvLen );

					if ( d === undefined ) {

						this.addUV( ia, ib, ic );

					} else {

						id = this.parseUVIndex( ud, uvLen );

						this.addUV( ia, ib, id );
						this.addUV( ib, ic, id );

					}

				}

				if ( na !== undefined ) {

					// Normals are many times the same. If so, skip function call and parseInt.
					var nLen = this.normals.length;
					ia = this.parseNormalIndex( na, nLen );

					ib = na === nb ? ia : this.parseNormalIndex( nb, nLen );
					ic = na === nc ? ia : this.parseNormalIndex( nc, nLen );

					if ( d === undefined ) {

						this.addNormal( ia, ib, ic );

					} else {

						id = this.parseNormalIndex( nd, nLen );

						this.addNormal( ia, ib, id );
						this.addNormal( ib, ic, id );

					}

				}

			},

			addLineGeometry: function ( vertices, uvs ) {

				this.object.geometry.type = 'Line';

				var vLen = this.vertices.length;
				var uvLen = this.uvs.length;

				for ( var vi = 0, l = vertices.length; vi < l; vi ++ ) {

					this.addVertexLine( this.parseVertexIndex( vertices[ vi ], vLen ) );

				}

				for ( var uvi = 0, l = uvs.length; uvi < l; uvi ++ ) {

					this.addUVLine( this.parseUVIndex( uvs[ uvi ], uvLen ) );

				}

			}

		};

		state.startObject( '', false );

		return state;

	},

	parse: function ( text ) {

		console.time( 'OBJLoader' );

		var state = this._createParserState();

		if ( text.indexOf( '\r\n' ) !== - 1 ) {

			// This is faster than String.split with regex that splits on both
			text = text.replace( /\r\n/g, '\n' );

		}

		if ( text.indexOf( '\\\n' ) !== - 1) {

			// join lines separated by a line continuation character (\)
			text = text.replace( /\\\n/g, '' );

		}

		var lines = text.split( '\n' );
		var line = '', lineFirstChar = '', lineSecondChar = '';
		var lineLength = 0;
		var result = [];

		// Faster to just trim left side of the line. Use if available.
		var trimLeft = ( typeof ''.trimLeft === 'function' );

		for ( var i = 0, l = lines.length; i < l; i ++ ) {

			line = lines[ i ];

			line = trimLeft ? line.trimLeft() : line.trim();

			lineLength = line.length;

			if ( lineLength === 0 ) continue;

			lineFirstChar = line.charAt( 0 );

			// @todo invoke passed in handler if any
			if ( lineFirstChar === '#' ) continue;

			if ( lineFirstChar === 'v' ) {

				lineSecondChar = line.charAt( 1 );

				if ( lineSecondChar === ' ' && ( result = this.regexp.vertex_pattern.exec( line ) ) !== null ) {

					// 0                  1      2      3
					// ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

					state.vertices.push(
						parseFloat( result[ 1 ] ),
						parseFloat( result[ 2 ] ),
						parseFloat( result[ 3 ] )
					);

				} else if ( lineSecondChar === 'n' && ( result = this.regexp.normal_pattern.exec( line ) ) !== null ) {

					// 0                   1      2      3
					// ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

					state.normals.push(
						parseFloat( result[ 1 ] ),
						parseFloat( result[ 2 ] ),
						parseFloat( result[ 3 ] )
					);

				} else if ( lineSecondChar === 't' && ( result = this.regexp.uv_pattern.exec( line ) ) !== null ) {

					// 0               1      2
					// ["vt 0.1 0.2", "0.1", "0.2"]

					state.uvs.push(
						parseFloat( result[ 1 ] ),
						parseFloat( result[ 2 ] )
					);

				} else {

					throw new Error( "Unexpected vertex/normal/uv line: '" + line  + "'" );

				}

			} else if ( lineFirstChar === "f" ) {

				if ( ( result = this.regexp.face_vertex_uv_normal.exec( line ) ) !== null ) {

					// f vertex/uv/normal vertex/uv/normal vertex/uv/normal
					// 0                        1    2    3    4    5    6    7    8    9   10         11         12
					// ["f 1/1/1 2/2/2 3/3/3", "1", "1", "1", "2", "2", "2", "3", "3", "3", undefined, undefined, undefined]

					state.addFace(
						result[ 1 ], result[ 4 ], result[ 7 ], result[ 10 ],
						result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ],
						result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ]
					);

				} else if ( ( result = this.regexp.face_vertex_uv.exec( line ) ) !== null ) {

					// f vertex/uv vertex/uv vertex/uv
					// 0                  1    2    3    4    5    6   7          8
					// ["f 1/1 2/2 3/3", "1", "1", "2", "2", "3", "3", undefined, undefined]

					state.addFace(
						result[ 1 ], result[ 3 ], result[ 5 ], result[ 7 ],
						result[ 2 ], result[ 4 ], result[ 6 ], result[ 8 ]
					);

				} else if ( ( result = this.regexp.face_vertex_normal.exec( line ) ) !== null ) {

					// f vertex//normal vertex//normal vertex//normal
					// 0                     1    2    3    4    5    6   7          8
					// ["f 1//1 2//2 3//3", "1", "1", "2", "2", "3", "3", undefined, undefined]

					state.addFace(
						result[ 1 ], result[ 3 ], result[ 5 ], result[ 7 ],
						undefined, undefined, undefined, undefined,
						result[ 2 ], result[ 4 ], result[ 6 ], result[ 8 ]
					);

				} else if ( ( result = this.regexp.face_vertex.exec( line ) ) !== null ) {

					// f vertex vertex vertex
					// 0            1    2    3   4
					// ["f 1 2 3", "1", "2", "3", undefined]

					state.addFace(
						result[ 1 ], result[ 2 ], result[ 3 ], result[ 4 ]
					);

				} else {

					throw new Error( "Unexpected face line: '" + line  + "'" );

				}

			} else if ( lineFirstChar === "l" ) {

				var lineParts = line.substring( 1 ).trim().split( " " );
				var lineVertices = [], lineUVs = [];

				if ( line.indexOf( "/" ) === - 1 ) {

					lineVertices = lineParts;

				} else {

					for ( var li = 0, llen = lineParts.length; li < llen; li ++ ) {

						var parts = lineParts[ li ].split( "/" );

						if ( parts[ 0 ] !== "" ) lineVertices.push( parts[ 0 ] );
						if ( parts[ 1 ] !== "" ) lineUVs.push( parts[ 1 ] );

					}

				}
				state.addLineGeometry( lineVertices, lineUVs );

			} else if ( ( result = this.regexp.object_pattern.exec( line ) ) !== null ) {

				// o object_name
				// or
				// g group_name

				// WORKAROUND: https://bugs.chromium.org/p/v8/issues/detail?id=2869
				// var name = result[ 0 ].substr( 1 ).trim();
				var name = ( " " + result[ 0 ].substr( 1 ).trim() ).substr( 1 );

				state.startObject( name );

			} else if ( this.regexp.material_use_pattern.test( line ) ) {

				// material

				state.object.startMaterial( line.substring( 7 ).trim(), state.materialLibraries );

			} else if ( this.regexp.material_library_pattern.test( line ) ) {

				// mtl file

				state.materialLibraries.push( line.substring( 7 ).trim() );

			} else if ( ( result = this.regexp.smoothing_pattern.exec( line ) ) !== null ) {

				// smooth shading

				// @todo Handle files that have varying smooth values for a set of faces inside one geometry,
				// but does not define a usemtl for each face set.
				// This should be detected and a dummy material created (later MultiMaterial and geometry groups).
				// This requires some care to not create extra material on each smooth value for "normal" obj files.
				// where explicit usemtl defines geometry groups.
				// Example asset: examples/models/obj/cerberus/Cerberus.obj

				var value = result[ 1 ].trim().toLowerCase();
				state.object.smooth = ( value === '1' || value === 'on' );

				var material = state.object.currentMaterial();
				if ( material ) {

					material.smooth = state.object.smooth;

				}

			} else {

				// Handle null terminated files without exception
				if ( line === '\0' ) continue;

				throw new Error( "Unexpected line: '" + line  + "'" );

			}

		}

		state.finalize();

		var container = new THREE.Group();
		container.materialLibraries = [].concat( state.materialLibraries );

		for ( var i = 0, l = state.objects.length; i < l; i ++ ) {

			var object = state.objects[ i ];
			var geometry = object.geometry;
			var materials = object.materials;
			var isLine = ( geometry.type === 'Line' );

			// Skip o/g line declarations that did not follow with any faces
			if ( geometry.vertices.length === 0 ) continue;

			var buffergeometry = new THREE.BufferGeometry();

			buffergeometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( geometry.vertices ), 3 ) );

			if ( geometry.normals.length > 0 ) {

				buffergeometry.addAttribute( 'normal', new THREE.BufferAttribute( new Float32Array( geometry.normals ), 3 ) );

			} else {

				buffergeometry.computeVertexNormals();

			}

			if ( geometry.uvs.length > 0 ) {

				buffergeometry.addAttribute( 'uv', new THREE.BufferAttribute( new Float32Array( geometry.uvs ), 2 ) );

			}

			// Create materials

			var createdMaterials = [];

			for ( var mi = 0, miLen = materials.length; mi < miLen ; mi++ ) {

				var sourceMaterial = materials[mi];
				var material = undefined;

				if ( this.materials !== null ) {

					material = this.materials.create( sourceMaterial.name );

					// mtl etc. loaders probably can't create line materials correctly, copy properties to a line material.
					if ( isLine && material && ! ( material instanceof THREE.LineBasicMaterial ) ) {

						var materialLine = new THREE.LineBasicMaterial();
						materialLine.copy( material );
						material = materialLine;

					}

				}

				if ( ! material ) {

					material = ( ! isLine ? new THREE.MeshPhongMaterial() : new THREE.LineBasicMaterial() );
					material.name = sourceMaterial.name;

				}

				material.shading = sourceMaterial.smooth ? THREE.SmoothShading : THREE.FlatShading;

				createdMaterials.push(material);

			}

			// Create mesh

			var mesh;

			if ( createdMaterials.length > 1 ) {

				for ( var mi = 0, miLen = materials.length; mi < miLen ; mi++ ) {

					var sourceMaterial = materials[mi];
					buffergeometry.addGroup( sourceMaterial.groupStart, sourceMaterial.groupCount, mi );

				}

				var multiMaterial = new THREE.MultiMaterial( createdMaterials );
				mesh = ( ! isLine ? new THREE.Mesh( buffergeometry, multiMaterial ) : new THREE.LineSegments( buffergeometry, multiMaterial ) );

			} else {

				mesh = ( ! isLine ? new THREE.Mesh( buffergeometry, createdMaterials[ 0 ] ) : new THREE.LineSegments( buffergeometry, createdMaterials[ 0 ] ) );
			}

			mesh.name = object.name;

			container.add( mesh );

		}

		console.timeEnd( 'OBJLoader' );

		return container;

	}

};


/***/ }),

/***/ 696:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var assign = __webpack_require__(33);

var ScreenLayerView = __webpack_require__(654);
module.exports = ScreenLayerView.types.canvas = ScreenLayerView.extend({
  template: function() {
    return '<canvas id="' + this.model.getId() + '" view-id="' + this.cid + '"></canvas>';
  },

  derived: {
    offCanvas: {
      deps: ['width', 'height', 'el'],
      fn: function() {
        var canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        return canvas;
      }
    },
    ctx: {
      deps: ['offCanvas'],
      fn: function() {
        return this.offCanvas.getContext('2d');
      }
    },
    destCtx: {
      deps: ['el', 'width', 'height'],
      fn: function() {
        return this.el.getContext('2d');
      }
    }
  },

  session: {
    frames: ['number', true, 0]
  },

  update: function() {
    ScreenLayerView.prototype.update.apply(this, arguments);
    this.model.frametime = this.parent.model.frametime;
    if (!this.parent || !this.parent.el) return;

    var cw = this.width = this.parent.el.clientWidth;
    var ch = this.height = this.parent.el.clientHeight;
    var ctx = this.ctx;
    ctx.clearRect(0, 0, cw, ch);
    if (!this.model.active) { return this; }

    this.model.canvasLayers.filter(function (layer) {
      return layer.active;
    }).forEach(function(layer) {
      layer.draw(ctx);
    });

    this.frames++;
    if (this.model.clear && this.frames >= this.model.clear) {
      this.destCtx.clearRect(0, 0, cw, ch);
      this.frames = 0;
    }

    this.destCtx.drawImage(this.offCanvas, 0, 0, cw, ch, 0, 0, cw, ch);

    return this;
  },


  bindings: assign({
    width: {
      name: 'width',
      type: 'attribute'
    },
    height: {
      name: 'height',
      type: 'attribute'
    }
  }, ScreenLayerView.prototype.bindings)
});

/***/ }),

/***/ 699:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ScreenLayerView = __webpack_require__(654);
var _cacheImgs = {};
function loadImg(url, viewId, done) {
  if (_cacheImgs[url]) {
    return done(null, _cacheImgs[url]);
  }

  var img = new Image();
  _cacheImgs[viewId+url] = img;
  img.onload = function() {
    done(null, img);
  };
  img.onerror = function() {};
  img.src = url;
  return done(null, _cacheImgs[viewId+url]);
}

module.exports = ScreenLayerView.types.img = ScreenLayerView.extend({
  template: function() {
    return '<canvas class="layer-image" id="' + this.model.getId() + '" view-id="' + this.cid + '"></canvas>';
  },

  initialize: function() {
    var view = this;
    ScreenLayerView.prototype.initialize.apply(view, arguments);


    function load() {
      var src = view.model.src;
      if (!src) return view.clearImage();
      loadImg(src, view.getId(), function(err, img) {
        view.drawImage(img);
      });
    }

    view.on('change:width change:height', load);
    view.model.on('change:src', load);
    load();
  },

  derived: {
    ctx: {
      deps: ['el'],
      fn: function() {
        if (!this.el) return;
        return this.el.getContext('2d');
      }
    }
  },

  _resizeCanvas: function() {
    if (!this.el || !this.el.parentNode) return this;
    var cnv = this.el;
    var dw = cnv.parentNode.clientWidth;
    var dh = cnv.parentNode.clientHeight;
    if (cnv.width != dw) cnv.width = dw;
    if (cnv.height != dh) cnv.height = dh;
    return this;
  },

  clearImage: function() {
    var ctx = this.ctx;
    if (!ctx) return this;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return this;
  },

  drawImage: function(img) {
    var ctx = this._resizeCanvas().clearImage().ctx;
    if (!ctx) return this;
    ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
    return this;
  }
});

/***/ }),

/***/ 703:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ScreenLayerView = __webpack_require__(654);

module.exports = ScreenLayerView.types.SVG = ScreenLayerView.extend({
  autoRender: true,

  template: function() {
    return '<div class="layer-svg" id="' + this.model.getId() + '" view-id="' + this.cid + '"></div>';
  },

  derived: {
    svg: {
      deps: ['el', 'model.content'],
      fn: function() {
        return this.el && this.model.content ? this.query('svg') || false : false;
      }
    },
    styleEl: {
      deps: ['model.content'],
      fn: function() {
        var id = this.model.getId();
        var el = document.getElementById('style-' + id);
        if (!el) {
          el = document.createElement('style');
          el.id = 'style-' + id;
          el.appendChild(document.createTextNode(''));
          document.head.appendChild(el);
        }
        return el;
      }
    },
  },

  updateStyles: function() {
    if (!this.model.active || !this.el) return this;
    var selectors = Object.keys(this.model.svgStyles);
    selectors.forEach(function(selector) {
      this.addRule('>svg ' + selector, this.model.svgStyles[selector]);
    }, this);
    return this;
  },

  updateProperties: function() {
    if (!this.model.active || !this.el) return this;
    this.model.styleProperties.forEach(function(styleProp) {
      this.setProperty(styleProp.name, styleProp.value);
    }, this);
    return this;
  },

  updateContent: function() {
    if (!this.el || this.el.innerHTML === this.model.content) return this;

    this.el.innerHTML = this.model.content;
    this.updateStyles().updateProperties();
  },

  initialize: function() {
    ScreenLayerView.prototype.initialize.apply(this, arguments);
    this.updateContent().updateStyles().updateProperties();

    this.listenTo(this.model, 'change:content', this.updateContent);
    this.on('change:el', this.updateContent);

    this.listenToAndRun(this.model, 'change:svgStyles', this.updateStyles);
    this.listenToAndRun(this.model.styleProperties, 'add remove change', this.updateProperties);
  },

  addRule: function(selector, properties) {
    ScreenLayerView.prototype.addRule.call(this, selector, properties);
    return this;
  }
});


/***/ }),

/***/ 707:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var assign = __webpack_require__(33);
var LayerView = __webpack_require__(654);
var TxtLayerView = LayerView.types.txt = LayerView.extend({
  autoRender: true,

  template: function() {
    return '<div class="layer-txt" id="' + this.model.getId() + '" view-id="' + this.cid + '"><div class="text"></div></div>';
  },

  bindings: assign(LayerView.prototype.bindings, {
    'model.text': '.text'
  })
});
module.exports = TxtLayerView;

/***/ }),

/***/ 709:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ScreenLayerView = __webpack_require__(654);
module.exports = ScreenLayerView.types.video = ScreenLayerView.extend({
  template: function() {
    return '<video id="' + this.model.cid + '" view-id="' + this.cid + '" autoplay loop muted></video>';
  },

  bindings: __webpack_require__(33)({
    'model.src': {
      type: 'attribute',
      name: 'src'
    }
  }, ScreenLayerView.prototype.bindings)
});

/***/ })

});
//# sourceMappingURL=build.js.map