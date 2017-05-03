webpackJsonp([4,6],{

/***/ 14:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/* global Uint8Array*/

var State = __webpack_require__(11);
var ScreenState = State.extend({
  initialize: function(attributes, options = {}) {
    this._isControllerState = !!options.router;
  },

  mappable: {
    source: ['midi', 'frametime', 'clock', 'signals'],
    target: ['layers', 'signals', 'clock']
  },

  session: {
    audio: ['object', true, function() { return {
      bufferLength: 128,
      frequency: new Uint8Array(128),
      timeDomain: new Uint8Array(128)
    }; }],
    latency: ['number', true, 0]
  },

  children: {
    clock: __webpack_require__(413)
  },

  collections: {
    layers: __webpack_require__(391)
  },

  derived: {
    frametime: {
      deps: ['clock.frametime'],
      fn: function() {
        return this.clock.frametime;
      }
    },
    hasDOM: {
      deps: [],
      fn: function() {
        return typeof DedicatedWorkerGlobalScope === 'undefined';
      }
    },
    isControllerState: {
      deps: [],
      fn: function() {
        return this._isControllerState;
      }
    },
    location: {
      deps: ['hasDOM', 'isControllerState'],
      fn: function() {
        return this.isControllerState ? 'control' : (this.hasDOM ? 'screen' : 'worker');
      }
    }
  },

  _log: function(...args) {
    var color = this.location === 'screen' ? 'lightblue' : (this.location === 'control' ? 'lightgreen' : 'pink');
    var txt = args.shift();
    console.log('%c'+ this.location[0].toUpperCase() + ': ' + txt, 'color:' + color, ...args);
  },

  toJSON: function() {
    var obj = State.prototype.toJSON.apply(this, arguments);
    delete obj.audio;
    return obj;
  }
});

module.exports = ScreenState;


/***/ }),

/***/ 150:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var State = __webpack_require__(11);

var objectPath = __webpack_require__(347);
var ParameterCollection = __webpack_require__(349);

var LayerState = State.extend({
  idAttribute: 'name',
  typeAttribute: 'type',

  initialize: function() {
    var state = this;

    state.ensureParameters();

    state.listenToAndRun(state.parameters, 'change', function() {
      state.trigger('change:parameters', state, state.parameters, {parameters: true});
    });
  },

  collections: {
    parameters: ParameterCollection
  },

  baseParameters: [
    {name: 'zIndex', type: 'number', default: 0},
    {name: 'active', type: 'boolean', default: true}
  ],

  ensureParameters: function(definition = []) {
    (this.baseParameters || [])
      .concat(definition)
      .forEach(function(parameterDef) {
        var existing = this.parameters.get(parameterDef.name);
        if (!existing) {
          var created = this.parameters.add(parameterDef);
          this.listenTo(created, 'change:value', function(...args) {
            this.trigger('change:parameters.' + created.name, ...args);
          });
          created.value = parameterDef.default;
        }
      }, this);
    return this;
  },

  props: {
    name: ['string', true, null],
    type: ['string', true, 'default'],
    layerStyles: ['string', false, '']
  },

  derived: {
    modelPath: {
      deps: ['name'],
      fn: function() {
        return objectPath(this);
      }
    },
    active: {
      deps: ['parameters.active'],
      fn: function() {
        return this.parameters.getValue('active');
      }
    },
    zIndex: {
      deps: ['parameters.zIndex'],
      fn: function() {
        return this.parameters.getValue('zIndex');
      }
    },
    screenState: {
      deps: ['collection', 'collection.parent'],
      fn: function() {
        return this.collection.parent;
      }
    },
    hasDOM: {
      deps: ['screenState'],
      fn: function() {
        return this.screenState && this.screenState.hasDOM;
      }
    },
    isControllerState: {
      deps: ['screenState'],
      fn: function() {
        return this.screenState && this.screenState.isControllerState;
      }
    },
    location: {
      deps: ['isControllerState', 'hasDOM'],
      fn: function() {
        return this.screenState ? this.screenState.location : false;
      }
    },

    mappable: {
      deps: [],
      fn: function() {
        var proto = this.constructor.prototype;
        var keys = Object.keys(proto._definition || {}).concat(
          Object.keys(proto._children || {}),
          Object.keys(proto._collections || {})
        ).filter(function(key) {
          return key !== this.idAttribute && key !== this.typeAttribute;
        }, this);

        return {
          source: [],
          target: keys
        };
      }
    }
  },

  _log: function(...args) {
    this.screenState._log(...args);
  }
});

LayerState.types = {};

module.exports = LayerState;

/***/ }),

/***/ 154:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var Collection = __webpack_require__(16);
var ParameterCollection = __webpack_require__(349);
var ScreenLayerState = __webpack_require__(150);
var mockedCtx = __webpack_require__(350);
var compileFunction = __webpack_require__(356);
function drawLayerCtx() {
  /*
    You can access the canvas 2d context with the global ctx
  */
}

var CanvasLayer = ScreenLayerState.extend({
  idAttribute: 'name',
  cache: {},

  props: {
    drawFunction: ['any', true, function() { return drawLayerCtx; }]
  },

  collections: {
    parameters: ParameterCollection
  },

  toJSON: function(...args) {
    return this.toJSON(...args);
  },

  derived: {
    mappable: {
      deps: ScreenLayerState.prototype._derived.mappable.deps,
      fn: function() {
        var mappable = ScreenLayerState.prototype._derived.mappable.fn.apply(this, arguments);
        var targets = mappable.target.filter(function(key) {
          return [
            'drawFunction',
            'screenState', // would make a circular reference if not excluded!
            'draw'
          ].indexOf(key) < 0;
        });
        console.info('targets for %s', this.name, targets);
        return {
          source: [],
          target: targets
        };
      }
    },

    screenState: {
      deps: [],
      fn: function() {
        return this.collection.parent.screenState;
      }
    },

    frametime: {
      cache: false,
      deps: ['screenState'],
      fn: function() {
        if (!this.screenState) return 0;
        return this.screenState.clock.frametime || 0;
      }
    },
    audio: {
      cache: false,
      deps: ['screenState'],
      fn: function() {
        if (!this.screenState) return {};
        return this.screenState.audio || {};
      }
    },

    width: {
      deps: ['screenState', 'screenState.width'],
      fn: function() {
        return this.screenState.width || 400;
      }
    },
    height: {
      deps: ['screenState', 'screenState.height'],
      fn: function() {
        return this.screenState.height || 300;
      }
    },
    draw: {
      deps: ['drawFunction'],
      fn: function() {
        var fn, result, err;

        try {
          fn = compileFunction(this.drawFunction);
          result = fn.call(this, mockedCtx);
          err = result instanceof Error ? result : null;
        }
        catch(e) {
          err = e;
        }

        if (err) {
          console.warn('draw function error', err.stack);
          fn = function() { return err; };
        }

        return fn.bind(this);
      }
    }
  }
});

var CanvasLayers = Collection.extend({
  mainIndex: 'name',
  comparator: 'zIndex',

  model: function (attrs, options) {
    var inst =  new CanvasLayer(attrs, options);
    if (options.init === false) inst.initialize();
    return inst;
  }
});


module.exports = ScreenLayerState.types.canvas = ScreenLayerState.extend({
  baseParameters: ScreenLayerState.prototype.baseParameters.concat([
    {name: 'clear', type: 'number', default: 1}
  ]),

  derived: {
    clear: {
      deps: ['parameters.clear'],
      fn: function() {
        return this.parameters.getValue('clear');
      }
    }
  },

  collections: {
    canvasLayers: CanvasLayers
  }
});

/***/ }),

/***/ 155:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ScreenLayerState = __webpack_require__(150);
module.exports = ScreenLayerState.types.img = ScreenLayerState.extend({
  baseParameters: [
    {name: 'src', type: 'string', default: ''}
  ].concat(ScreenLayerState.prototype.baseParameters),

  derived: {
    src: {
      deps: ['parameters.src'],
      fn: function() {
        return this.parameters.getValue('src');
      }
    }
  },

  initialize: function() {
    ScreenLayerState.prototype.initialize.apply(this, arguments);
  }
});

/***/ }),

/***/ 156:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LayerState = __webpack_require__(150);

var P5LayerState = LayerState.types.p5 = LayerState.extend({
  props: {
    setupFunction: ['string', false, 'console.info("no p5 setupFunction set");'],
    drawFunction: ['string', false, 'console.info("no p5 drawFunction set");']
  }
});
module.exports = P5LayerState;

/***/ }),

/***/ 157:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ScreenLayerState = __webpack_require__(150);
var Extractor = __webpack_require__(357);

module.exports = ScreenLayerState.types.SVG = ScreenLayerState.extend({
  baseParameters: [
    {name: 'src', type: 'string', default: ''}
  ].concat(ScreenLayerState.prototype.baseParameters),

  props: {
    svgStyles: ['object', true, function() { return {}; }]
  },

  session: {
    content: ['string', false, '']
  },

  derived: {
    src: {
      deps: ['parameters.src'],
      fn: function() {
        return this.parameters.getValue('src');
      }
    },
    mappable: {
      deps: [],
      fn: function() {
        return {
          source: [],
          target: [
            'parameters'
          ]
        };
      }
    }
  },

  initialize: function() {
    var svgState = this;
    ScreenLayerState.prototype.initialize.apply(svgState, arguments);

    // load the svg string content from the worker only
    if (!svgState.hasDOM) {
      svgState.listenToAndRun(svgState, 'change:src', function() {
        svgState.set({content: ''}, {silent: true});
        svgState.loadSVG();
      });
    }

    // only create an extractor for the state used in the controller
    if (svgState.isControllerState) {
      svgState.listenToAndRun(svgState, 'change:content', function() {
        if (svgState.content) svgState.extractor = new Extractor({model: svgState});
      });
    }

    svgState.listenTo(svgState.screenState, 'app:broadcast:bootstrap', function() {
      svgState.loadSVG();
    });
  },

  loadSVG: function(done) {
    var state = this;
    done = done || function(err/*, obj*/) {
      if (err) {
        // console.warn(err.message);
        return;
      }
      // console.info('loaded');
    };

    var src = state.src;
    if (!src) {
      state.content = '';
      return done(new Error('No src to load for ' + state.getId() + ' SVG layer'), state);
    }

    fetch(src)
      .then(function(res) {
        return res.text();
      })
      .then(function(string) {
        state.content = string;
        done(null, state);
      })
      .catch(function(err) {
        state.content = '';
        done(err, state);
      });
  },

  serialize: function() {
    var obj = ScreenLayerState.prototype.serialize.apply(this, arguments);
    obj.content = this.content;
    return obj;
  },

  toJSON: function() {
    var obj = ScreenLayerState.prototype.toJSON.apply(this, arguments);
    delete obj.content;
    return obj;
  }
});

/***/ }),

/***/ 158:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ScreenLayerState = __webpack_require__(150);
var State = __webpack_require__(11);
var Collection = __webpack_require__(16);
var ParameterCollection = __webpack_require__(349);

/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/

var Euler = State.extend({
  props: {
    x: ['number', true, 0],
    y: ['number', true, 0],
    z: ['number', true, 0]
  }
});
var Vector3 = State.extend({
  props: {
    x: ['number', true, 0],
    y: ['number', true, 0],
    z: ['number', true, 0]
  }
});
// var Curve = State.extend({

// });
// var CurvePath = State.extend({

// });
// var Path = CurvePath.extend({

// });
var Shape = State.extend({

});
var ShapeCollection = Collection.extend({
  model: Shape
});


var Color = State.extend({
  props: {
    r: ['number', true, 122],
    g: ['number', true, 122],
    b: ['number', true, 122]
  }
});


/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/



var ThreeState = State.extend({
  idAttribute: 'name',
  typeAttribute: 'type',
  props: {
    visible: ['boolean', true, true],
    type: ['string', true, null],
    name: ['string', true, null]
  },
  children: {
    position: Vector3,
    rotation: Euler,
    scale: Vector3
  }
});

function makeCollectionModel(StateKind) {
  return function(attrs, opts) {
    var Constructor = StateKind.types[attrs.type] || StateKind;
    var state = new Constructor(attrs, opts);
    return state;
  };
}


// function collectionParse(data) {
//   console.info('typeof data', typeof data);
//   return data;
// }


// function collectionToJSON() {
//   var data = {};
//   this.forEach(function(model) {// jshint ignore:line
//     data[model.getId()] = model.serialize();
//     delete data[model.getId()][model.idAttribute];
//   });
//   // console.info('collectionToJSON', data);
//   return data;
// }



/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/
var MaterialState = State.extend({
  idAttribute: 'name',
  typeAttribute: 'type',
  props: {
    type: ['string', false, null],
    name: ['string', false, null]
  },
  children: {
    color: Color
  }
});

MaterialState.types = {};



var MaterialCollection = Collection.extend({
  mainIndex: 'name',
  // parse: collectionParse,
  // toJSON: collectionToJSON,
  // serialize: collectionToJSON,
  model: makeCollectionModel(MaterialState)
});



/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/

var GeometryState = ThreeState.extend({
  children: {
    material: MaterialState
  }
});

GeometryState.types = {};
// BoxBufferGeometry
// BoxGeometry
GeometryState.types.box = GeometryState.extend({
  signature: ['width', 'height', 'depth'],
  threeClassName: 'BoxGeometry',
  props: {
    width: ['number', true, 5],
    height: ['number', true, 5],
    depth: ['number', true, 5],
  }
});
// CircleBufferGeometry
// CircleGeometry
GeometryState.types.circle = GeometryState.extend({
  signature: ['radius', 'segments', 'thetaStart', 'thetaLength'],
  threeClassName: 'CircleGeometry',
  props: {
    radius: ['number', true, 10],
    segments: ['number', true, 8],
    thetaStart: ['number', true, 0],
    thetaLength: ['number', true, Math.PI * 2]
  }
});
// ConeBufferGeometry
// ConeGeometry
GeometryState.types.cone = GeometryState.extend({
  signature: ['radius', 'height', 'radialSegments', 'heightSegments', 'openEnded', 'thetaStart', 'thetaLength'],
  threeClassName: 'ConeGeometry',
  props: {
    radius: ['number', true, 10],
    height: ['number', true, 10],
    radialSegments: ['number', true, 8],
    heightSegments: ['number', true, 1],
    openEnded: ['boolean', true, false],
    thetaStart: ['number', true, 0],
    thetaLength: ['number', true, Math.PI * 2]
  }
});
// CylinderBufferGeometry
// CylinderGeometry
GeometryState.types.cylinder = GeometryState.extend({
  signature: [
    'radiusTop',
    'radiusBottom',
    'height',
    'radialSegments',
    'heightSegments',
    'openEnded',
    'thetaStart',
    'thetaLength'
  ],
  threeClassName: 'CylinderGeometry',
  props: {
    radiusTop: ['number', true, 10],
    radiusBottom: ['number', true, 10],
    height: ['number', true, 10],
    radialSegments: ['number', true, 8],
    heightSegments: ['number', true, 1],
    openEnded: ['boolean', true, false],
    thetaStart: ['number', true, 0],
    thetaLength: ['number', true, Math.PI * 2]
  }
});
// DodecahedronBufferGeometry
// DodecahedronGeometry
// EdgesGeometry
// ExtrudeGeometry
GeometryState.types.extrude = GeometryState.extend({
  signature: ['shapes', 'options'],
  threeClassName: 'ExtrudeGeometry',
  collections: {
    shapes: ShapeCollection
  },
  props: {
    curveSegments: 'any',// int. number of points on the curves
    steps: 'any',// int. number of points used for subdividing segements of extrude spline
    amount: 'any',// int. Depth to extrude the shape
    bevelEnabled: 'any',// bool. turn on bevel
    bevelThickness: 'any',// float. how deep into the original shape bevel goes
    bevelSize: 'any',// float. how far from shape outline is bevel
    bevelSegments: 'any',// int. number of bevel layers
    extrudePath: 'any',// THREE.CurvePath. 3d spline path to extrude shape along. (creates Frames if frames aren't defined)
    frames: 'any',// THREE.TubeGeometry.FrenetFrames. containing arrays of tangents, normals, binormals
    material: 'any',// int. material index for front and back faces
    extrudeMaterial: 'any',// int. material index for extrusion and beveled faces
    UVGenerator: 'any',// Object. object that provides UV generator functions
  }
});
// IcosahedronBufferGeometry
// IcosahedronGeometry
// LatheBufferGeometry
// LatheGeometry
// OctahedronBufferGeometry
// OctahedronGeometry
// ParametricBufferGeometry
// ParametricGeometry
GeometryState.types.parametric = GeometryState.extend({
  signature: ['func', 'slices', 'stacks'],
  threeClassName: 'ParametricGeometry',
  props: {
    func: ['string', true, 'function(u, v) { return new THREE.Vector3(); }'],
    slices: ['number', true, 5],
    stacks: ['number', true, 5]
  }
});
// PlaneBufferGeometry
// PlaneGeometry
// PolyhedronBufferGeometry
// PolyhedronGeometry
// RingBufferGeometry
// RingGeometry
// ShapeBufferGeometry
// ShapeGeometry
// SphereBufferGeometry
// SphereGeometry
// TetrahedronBufferGeometry
// TetrahedronGeometry
// TextGeometry
// TorusBufferGeometry
// TorusGeometry
// TorusKnotBufferGeometry
// TorusKnotGeometry
// TubeGeometry
// TubeBufferGeometry
// WireframeGeometry


var GeometryCollection = Collection.extend({
  mainIndex: 'name',
  // parse: collectionParse,
  // toJSON: collectionToJSON,
  // serialize: collectionToJSON,
  model: makeCollectionModel(GeometryState)
});



/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/
var LightState = ThreeState.extend({
  props: {
    intensity: ['number', true, 1]
  },
  children: {
    color: Color
  }
});

LightState.types = {};
// AmbientLight
LightState.types.ambient = LightState.extend({
  signature: [],
  threeClassName: 'AmbientLight',
});
// DirectionalLight
LightState.types.directonal = LightState.extend({
  signature: [],
  threeClassName: 'DirectionalLight',
  children: {
    lookAt: Vector3
  }
});
// HemisphereLight
// Vector3Light
// RectAreaLight
// SpotLight




var LightCollection = Collection.extend({
  mainIndex: 'name',
  // parse: collectionParse,
  // toJSON: collectionToJSON,
  // serialize: collectionToJSON,
  model: makeCollectionModel(LightState)
});



/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/
var CameraState = ThreeState.extend({
  children: {
    lookAt: Vector3
  }
});

CameraState.types = {};
// CubeCamera
// OrthographicCamera
CameraState.types.orthographic = CameraState.extend({
  signature: ['left', 'right', 'top', 'bottom', 'near', 'far'],
  threeClassName: 'OrthographicCamera',
  props: {
    left: ['number', true, 80],
    right: ['number', true, 80],
    top: ['number', true, 60],
    bottom: ['number', true, 60],
    near: ['number', true, 0.1],
    far: ['number', true, 2000]
  }
});
// PerspectiveCamera
CameraState.types.perspective = CameraState.extend({
  signature: ['fov', 'aspect', 'near', 'far'],
  threeClassName: 'PerspectiveCamera',
  props: {
    focus: ['number', true, 10],
    fov: ['number', true, 50],
    aspect: ['number', true, 1],
    near: ['number', true, 0.1],
    far: ['number', true, 2000],
    zoom: ['number', true, 1]
  }
});
// StereoCamera



var CameraCollection = Collection.extend({
  mainIndex: 'name',
  // parse: collectionParse,
  // toJSON: collectionToJSON,
  // serialize: collectionToJSON,
  model: makeCollectionModel(CameraState)
});



/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/
var LoaderState = ThreeState.extend({
  props: {
    path: ['string', false, ''],
    src: ['string', true, ''],
  },
  children: {
    material: MaterialState
  }
});

LoaderState.types = {};
LoaderState.types.obj = LoaderState.extend({});
LoaderState.types.objmtl = LoaderState.extend({
  props: {
    mtl: ['string', true, '']
  }
});

var LoaderCollection = Collection.extend({
  mainIndex: 'name',
  model: makeCollectionModel(LoaderState)
});



/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/
module.exports = ScreenLayerState.types.threejs = ScreenLayerState.extend({
  props: {
    currentCamera: ['string', false, null],
    renderFunction: ['string', true, 'function() { console.info(\'missing renderFunction for %s\', layer.model.getId()); }'],
    updateFunction: ['string', true, 'function() { console.info(\'missing updateFunction for %s\', layer.model.getId()); }']
  },

  collections: {
    parameters: ParameterCollection,
    //
    geometries: GeometryCollection,
    lights: LightCollection,
    cameras: CameraCollection,
    materials: MaterialCollection,
    //
    loaders: LoaderCollection
  },

  // parse: function(data) {
  //   console.info('parse three data', data);

  //   [
  //     'geometries',
  //     'lights',
  //     'cameras',
  //     'materials'
  //   ].forEach(function(collectionName) {
  //     data[collectionName] = Object.keys(data[collectionName] || {}).map(function(name) {
  //       var obj = data[collectionName][name];
  //       obj.name = name;
  //       return obj;
  //     });
  //   });

  //   return data;
  // },

  // toJSON: function() {
  //   var data = ScreenLayerState.prototype.toJSON.apply(this, arguments);
  //   // console.info('toJSON', data.cameras);
  //   return data;
  // },

  // serialize: function() {
  //   var data = ScreenLayerState.prototype.serialize.apply(this, arguments);
  //   // console.info('serialize', data.cameras);
  //   return data;
  // },

  initialize: function(attrs) {
    ScreenLayerState.prototype.initialize.apply(this, arguments);
    var noLights = !this.lights.length && (!attrs.lights || !attrs.lights.length);
    var noCameras = !this.cameras.length && (!attrs.cameras || !attrs.cameras.length);
    var noGeometries = !this.geometries.length && (!attrs.geometries || !attrs.geometries.length);

    if (noLights) {
      this.lights.add([
        {
          type: 'ambient',
          name: 'defaultambient',
          color: {
            r: 1,
            g: 1,
            b: 1
          }
        },
        {
          type: 'directonal',
          name: 'defaultdirectonal',
          color: {
            r: 1,
            g: 1,
            b: 1
          },
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
        }
      ]);
    }

    if (noCameras) {
      this.cameras.add([
        {
          type: 'perspective',
          name: 'defaultperspective',
          position: {
            x: 35,
            y: 35,
            z: 35
          },
          lookAt: {
            x: 0,
            y: 0,
            z: 0
          }
        },
        {
          type: 'orthographic',
          name: 'defaultortho',
          position: {
            x: 35,
            y: 35,
            z: 35
          },
          lookAt: {
            x: 0,
            y: 0,
            z: 0
          }
        }
      ]);
    }

    if (noGeometries && !attrs.loaders) {
      this.geometries.add([
        {
          type: 'box',
          name: 'defaultbox',
          position: {
            x: 0,
            y: 0,
            z: 0
          }
        }
      ]);
    }
  }
});

/***/ }),

/***/ 159:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var LayerState = __webpack_require__(150);
var TxtLayerState = LayerState.types.txt = LayerState.extend({
  baseParameters: [
    {name: 'text', type: 'string', default: ''}
  ].concat(LayerState.prototype.baseParameters),

  derived: {
    text: {
      deps: ['parameters.text'],
      fn: function() {
        return this.parameters.getValue('text');
      }
    }
  }
});
module.exports = TxtLayerState;

/***/ }),

/***/ 160:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ScreenLayerState = __webpack_require__(150);
module.exports = ScreenLayerState.types.video = ScreenLayerState.extend({
  baseParameters: [
    {name: 'src', type: 'string', default: ''}
  ].concat(ScreenLayerState.prototype.baseParameters),

  derived: {
    src: {
      deps: ['parameters.src'],
      fn: function() {
        return this.parameters.getValue('src');
      }
    }
  }
});

/***/ }),

/***/ 347:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function isCollectionOfParent(o, p) {
  if (!p || !p._collections) return;
  for (var name in p._collections) {
    if (p[name] === o.collection) return name + '.' + o.getId();
  }
}

function isChildOfParent(o, p) {
  if (!p || !p._children) return;
  for (var name in p._children) {
    if (p[name] === o) return name;
  }
}

function isPropOfParent(o, p) {
  if (!p) return;
  for (var name in p) {
    if (p[name] === o) return name;
  }
}

var _paths = {};
function objectPath(state) {
  if (!state) return null;
  if (_paths[state.cid]) return _paths[state.cid];
  var parts = [];


  function up(instance) {
    var collectionName = instance.collection ?
                          isCollectionOfParent(instance, instance.collection.parent) :
                          null;
    if (collectionName) {
      parts.unshift(collectionName);
      return up(instance.collection.parent);
    }

    var childName = isChildOfParent(instance, instance.parent);
    if (childName) {
      parts.unshift(childName);
      return up(instance.parent);
    }


    var propName = isPropOfParent(instance, instance.parent);
    if (propName) {
      parts.unshift(propName);
      return up(instance.parent);
    }

    if (instance.parent) up(instance.parent);
  }

  up(state);

  _paths[state.cid] = parts.join('.');
  return _paths[state.cid];
}

module.exports = objectPath;

/***/ }),

/***/ 349:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var ParamState = __webpack_require__(358);
var Collection = __webpack_require__(16);

var ParamCollection = Collection.extend({
  mainIndex: 'name',
  model: ParamState,

  comparator: 'name',

  toJSON: function (...args) {
    return this.map(model => model.toJSON(...args));
  },

  getValue: function(name, defaultVal) {
    var param = this.get(name);
    if (!param) return defaultVal;
    var val = param.value;
    defaultVal = arguments.length === 2 ? defaultVal : param.default;
    return val === null || typeof val === 'undefined' ? defaultVal : val;
  }
});

module.exports = ParamCollection;

/***/ }),

/***/ 350:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var noop = function(){};
var mockedCtx = {
  save: noop,
  restore: noop,
  scale: noop,
  rotate: noop,
  translate: noop,
  transform: noop,
  setTransform: noop,
  resetTransform: noop,
  createLinearGradient: noop,
  createRadialGradient: noop,
  createPattern: noop,
  clearRect: noop,
  fillRect: noop,
  strokeRect: noop,
  beginPath: noop,
  fill: noop,
  stroke: noop,
  drawFocusIfNeeded: noop,
  clip: noop,
  isPointInPath: noop,
  isPointInStroke: noop,
  fillText: noop,
  strokeText: noop,
  measureText: noop,
  drawImage: noop,
  createImageData: noop,
  getImageData: noop,
  putImageData: noop,
  getContextAttributes: noop,
  setLineDash: noop,
  getLineDash: noop,
  closePath: noop,
  moveTo: noop,
  lineTo: noop,
  quadraticCurveTo: noop,
  bezierCurveTo: noop,
  arcTo: noop,
  rect: noop,
  arc: noop,
  ellipse: noop,
  // properties
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  filter: 'none',
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'low',
  strokeStyle: '#000000',
  fillStyle: '#000000',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  shadowBlur: 0,
  shadowColor: 'rgba(0, 0, 0, 0)',
  lineWidth: 1,
  lineCap: 'butt',
  lineJoin: 'miter',
  miterLimit: 10,
  lineDashOffset: 0,
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  canvas: {width: 400, height: 300},
  // utilities
  _: {}
};
mockedCtx._.methods = Object.keys(mockedCtx)
  .filter(function(name) {
    return typeof mockedCtx[name] === 'function';
  });
mockedCtx._.properties = Object.keys(mockedCtx)
  .filter(function(name) {
    return name != '_' && typeof mockedCtx[name] !== 'function';
  });
module.exports = mockedCtx;

/***/ }),

/***/ 352:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = function minMax(val, min = 0, max = 16) {
  return (Math.abs(min - max) * Number(val) * (1 / 127)) - min;
};

/***/ }),

/***/ 353:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = function midi2prct(val) {
  return __webpack_require__(359)(val, 127);
};

/***/ }),

/***/ 354:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = function midi2rad(val) {
  return Math.PI * 2 * (Number(val) * (1 / 127));
};

/***/ }),

/***/ 355:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function noop() {}

var utils = module.exports = {};

utils.random = function random(multi = 100) {
  return Math.random() * multi;
};

utils.between = function between(val, min, max) {
  return Math.max(min, Math.min(max, val));
};


utils.log = function log(ctx, ...args) {
  console.info(...args);
};


utils.midiMinMax = __webpack_require__(352);
utils.midi2Rad = __webpack_require__(354);
utils.midi2Prct = __webpack_require__(353);

/**
 * txt
 * @param [text]
 * @param [x]
 * @param [y]
 */
utils.txt = function txt(ctx, ...args) {
  var text, x, y;
  [
    text = '',
    x = ctx.canvas.width / 2,
    y = ctx.canvas.height / 2,
  ] = args;
  ctx.fillText(text, x, y);
};

/**
 * dot
 * @param [x]
 * @param [y]
 * @param [radius]: 10
 * @param [start]: 0
 * @param [end]: 360
 */
utils.dot = function dot(ctx, ...args) {
  var x, y, radius, start, end;
  [
    x = ctx.canvas.width / 2,
    y = ctx.canvas.height / 2,
    radius = 10,
    start = 0,
    end = Math.PI * 2
  ] = args;
  ctx.beginPath();
  ctx.arc(x, y, radius, start, end);
  ctx.closePath();
  ctx.fill();
};

/**
 * circle
 * @param [x]: <center>
 * @param [y]: <center>
 * @param [radius]: 10
 * @param [start]: 0
 * @param [end]: 360
 */
utils.circle = function circle(ctx, ...args) {
  var x, y, radius, start, end;
  [
    x = ctx.canvas.width / 2,
    y = ctx.canvas.height / 2,
    radius = 10,
    start = 0,
    end = Math.PI * 2
  ] = args;
  ctx.beginPath();
  ctx.arc(x, y, radius, start, end);
  ctx.closePath();
  ctx.stroke();
};


utils.line = function line(ctx, ...args) {
  ctx.beginPath();
  if (typeof args[0] === 'string') {
    ctx.strokeStyle = args.shift();
  }
  if (typeof args[0] === 'number') {
    ctx.lineWidth = args.shift();
  }
  if (!args.length) return;
  var point = args.shift();
  ctx.moveTo(point[0], point[1]);
  args.forEach(function(point) {
    ctx.lineTo(point[0], point[1]);
  });
  ctx.stroke();
};

/**
 * polygone
 * @param [x]: <center>
 * @param [y]: <center>
 * @param [size]: 30
 * @param [sides]: 3
 */
utils.polygone = function polygone(ctx, ...args) {
  ctx.beginPath();
  var sides, angle, i, x, y, lx, ly, size;
  [
    x,
    y,
    size = 30,
    sides = 3
  ] = args;
  var shift = Math.PI * 0.5;
  var rad = (Math.PI * 2) / sides;
  for (i = 0; i < sides; i++) {
    angle = rad * i + shift;
    lx = Math.round(x + Math.cos(angle) * size);
    ly = Math.round(y + Math.sin(angle) * size);
    if (!i) {
      ctx.beginPath();
    }
    ctx.lineTo(lx, ly);
  }

  ctx.closePath();
  ctx.stroke();
};


utils.grid = function grid(width, height, itemsCount, rowsCount, process) {
  process = typeof process === 'function' ? process : noop;
  var r = 0,
      c = 0,
      xy = [0,0],
      rowHeight = height / rowsCount,
      columnsCount = itemsCount / rowsCount,
      columnWidth = width / columnsCount
  ;

  // var args = [].slice.apply(arguments).map(item => typeof item);
  // console.info(...args);
  for (r = 0; r < rowsCount; r++) {
    for (c = 0; c < columnsCount; c++) {
      xy[1] = rowHeight * (r + 0.5);
      xy[0] = columnWidth * (c + 0.5);
      process(...xy);
    }
  }
};


/*
function () {
  var cx = width / 2;
  var cy = height / 2;
  var i = 0;
  var r;
  var s = -10;
  fillStyle('#fff');
  distribute(cx, cy, 12, cy, (layer.frametime % (360 * s)) / s, function(x, y, a) {
    r = (cy / 12) * i;
    fillText(a.toFixed(2), cx + (Math.cos(a) * r), cy + (Math.sin(a) * r));
    i++;
  });
}
*/
utils.distribute = function distribute(x, y, itemsCount, r, tilt, process) {
  itemsCount = itemsCount || 2;
  tilt = tilt || 0;
  process = typeof process === 'function' ? process : noop;
  var i, a, args;
  var rad = Math.PI * 2;
  for (i = 0; i < itemsCount; i++) {
    a = ((rad / itemsCount) * i) - Math.PI + ((rad / 360) * tilt);
    args = [
      x + (Math.cos(a) * r),
      y + (Math.sin(a) * r),
      a
    ];
    process(...args);
  }
};



utils.repeat = function repeat(times, process, ...args) {
  process = typeof process === 'function' ? process : noop;
  for (var i = 0; i < times; i++) {
    process(i, ...args);
  }
};


utils.cacheContext = function cacheContext(ctx, cache, max) {
  max = max || 0;
  if (!max) return;

  var w = ctx.canvas.width;
  var h = ctx.canvas.height;
  cache.unshift(ctx.getImageData(0, 0, w, h));
  if (cache.length >= max) cache.pop();
};

utils.restoreContexts = function restoreContexts(ctx, cache, count, preprocess, postprocess) {
  count = count || 1;
  preprocess = preprocess || noop;
  postprocess = postprocess || noop;
  // console.info(cache.length);
  for (var c = 1; c < count && c < cache.length; c++) {
    if (cache[c] instanceof ImageData) {
      try {
        ctx.putImageData(preprocess(cache[c]), 0, 0);
        postprocess();
      }
      catch (e) {
        console.info(e.message, cache[c] instanceof ImageData);
      }
    }
  }
};


/***/ }),

/***/ 356:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var mockedCtx = __webpack_require__(350);
var utils = __webpack_require__(355);// jshint ignore:line

// proxy the method and parameters of the canvas context
var ctxProperties = '';
mockedCtx._.methods
  .forEach(function(name) {
    ctxProperties += '\nvar ' + name + ' = function(...args) { try { ctx.' + name + '(...args); } catch(e){} };';
  });
mockedCtx._.properties
  .forEach(function(name) {
    if (name !== 'canvas') ctxProperties += '\nvar ' + name + ' = function(val) { if (val !== undefined) { ctx.' + name + ' = val; } return ctx.' + name + '; };';
  });

function compileFunction(drawFunction) {
  var fn;// jshint ignore:line

  var evaled = `fn = (function() {
  // override some stuff that should not be used
  var navigator, window, global, document, module, exports;

  return function(ctx) {
    const width = (ctx.canvas || {}).width || 400;
    const height = (ctx.canvas || {}).height || 300;
    const layer = this;
    const store = layer.cache;
    const frametime = layer ? layer.frametime : 0;
    const audio = layer ? layer.audio : {};
    const bufferLength = function() { return ((layer.audio || {}).bufferLength) || 128; };
    const frequency = function(x) {
      return ((layer.audio || {}).frequency || [])[x] || 0;
    };
    const timeDomain = function(x) {
      return ((layer.audio || {}).timeDomain || [])[x] || 0;
    };

    const parameter = function(name, defaultVal) {
      return layer.parameters.getValue(name, defaultVal);
    };

    ${ ctxProperties }
    const random = utils.random;
    const between = utils.between;
    const midiMinMax = utils.midiMinMax;
    const midi2rad = utils.midi2rad;
    const midi2prct = utils.midi2prct;

    const grid = function(...args) { utils.grid(width, height, ...args); };
    const distribute = function(...args) { utils.distribute(...args); };
    const repeat = function(...args) { utils.repeat(...args); };
    const log = function(...args) { utils.log(ctx, ...args); };
    const txt = function(...args) { utils.txt(ctx, ...args); };
    const dot = function(...args) { utils.dot(ctx, ...args); };
    const circle = function(...args) { utils.circle(ctx, ...args); };
    const polygone = function(...args) { utils.polygone(ctx, ...args); };
    const line = function(...args) { utils.line(ctx, ...args); };
    const cacheContext = function(...args) { utils.cacheContext(ctx, ...args); };
    const restoreContexts = function(...args) { utils.restoreContexts(ctx, ...args); };


    return (${ drawFunction.toString() })(ctx);
  };
})();`;
  eval(evaled);// jshint ignore:line
  return fn;
}

module.exports = compileFunction;

/***/ }),

/***/ 357:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var State = __webpack_require__(11);

var Extractor = State.extend({
  autoRender: true,
  template: '<div style="display: none"></div>',

  extractStyles: function() {
    var styles = {};
    var existingStyles = this.model.svgStyles || {};

    this.svg.querySelectorAll('[style][id]').forEach(function(styledEl) {
      styles['#' + styledEl.id] = existingStyles['#' + styledEl.id] || styledEl.getAttribute('style');
      styledEl.style = null;
    });

    return styles;
  },

  removeStylesFromContent: function() {
    this.svg.querySelectorAll('[style][id]').forEach(function(styledEl) {
      styledEl.style = null;
    });
    return this;
  },

  setPathLengths: function() {
    var paths = this.el.querySelectorAll('path');
    for (var p = 0; p < paths.length; p++) {
      paths[p].style.setProperty('--path-length', paths[p].getTotalLength());
    }
    return this;
  },

  extractProps: function() {
    var props = [];
    var name, value;

    for (var p = 0; p < this.svg.style.length; p++) {
      name = this.svg.style[p].slice(2);
      value = this.svg.style.getPropertyValue(name).trim();
      props.push({
        name: name,
        value: value,
        default: value
      });
    }

    this.svg.style = null;

    var previousParameters = this.model.parameters.serialize();
    return props.concat(previousParameters);
  },

  extract: function() {
    if (!this.el || this.el.innerHTML === this.model.content) return;
    this.el.innerHTML = this.model.content;

    this.svg = this.el.querySelector('svg');
    if (!this.svg) return;
    var svgState = this.model;

    var layer = {};
    layer[svgState.idAttribute] = svgState.getId();

    layer.svgStyles = Object.keys(svgState.svgStyles).length ? this.removeStylesFromContent().model.svgStyles : this.extractStyles();

    this.model.parameters.set(this.setPathLengths().extractProps());
    layer.parameters = this.model.parameters.serialize();

    layer.content = this.el.innerHTML;

    svgState.once('change:svgStyles', function() { svgState.trigger('svg:extracted'); });
    svgState.trigger('sendCommand', 'updateLayer', {layer: layer, broadcast: true});

    svgState.set('content', layer.content, {silent: true});

    return this;
  },

  initialize: function(options) {
    this.model = options.model;
    this.el = document.createElement('div');
    this.listenToAndRun(this.model, 'change:content', this.extract);
  }
});
module.exports = Extractor;

/***/ }),

/***/ 358:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var State = __webpack_require__(11);
var objectPath = __webpack_require__(347);

var ParamState = State.extend({
  idAttribute: 'name',

  mappable: {
    target: ['value']
  },

  props: {
    name: ['string', true, ''],
    type: ['string', false, ''],
    value: ['any', false, ''],
    default: ['any', false, '']
  },

  derived: {
    modelPath: {
      deps: ['name'],
      fn: function() {
        return objectPath(this);
      }
    }
  }
});

module.exports = ParamState;

/***/ }),

/***/ 359:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

module.exports = function prct(val, max = 255) {
  if (!val || !max) return 0;
  return (100 / max) * Number(val);
};

/***/ }),

/***/ 391:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var assign = __webpack_require__(15);
var Collection = __webpack_require__(16);
var LayerState = __webpack_require__(150);
__webpack_require__(154);
__webpack_require__(160);
__webpack_require__(157);
__webpack_require__(155);
__webpack_require__(159);
__webpack_require__(156);
__webpack_require__(158);

module.exports = Collection.extend({
  comparator: 'zIndex',
  mainIndex: 'name',
  model: function(attrs, opts) {
    var Constructor = LayerState.types[attrs.type] || LayerState;
    var state = new Constructor(attrs, opts);
    // state.on('change', function() {
    //   opts.collection.trigger('change:layer', state);
    // });
    return state;
  },

  toJSON: function () {
    return this.map(function (model) {
      if (model.toJSON) {
        return model.toJSON();
      }
      else {
        var out = {};
        assign(out, model);
        delete out.collection;
        return out;
      }
    });
  }
});

/***/ }),

/***/ 413:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var State = __webpack_require__(11);

var Clock = State.extend({
  mappable: {
    source: ['frametime', 'pausetime', 'starttime', 'bpm', 'beatprct', 'beatnum', 'beatlength'],
    target: ['beatdelay', 'bpm']
  },

  play: function() {
    var now = Date.now();
    this.starttime = this.pausetime ? this.starttime + (now - this.pausetime) : now;
    this.pausetime = 0;
    return this.refresh();
  },

  pause: function() {
    this.pausetime = Date.now();
    return this.refresh();
  },

  stop: function() {
    var now = Date.now();
    this.pausetime = now;
    this.starttime = now;
    this.frametime = 0;
    return this;
  },

  refresh: function() {
    if (this.playing) this.frametime = Date.now() - this.starttime;
    return this;
  },

  derived: {
    modelPath: {
      deps: [],
      fn: function() {
        return 'clock';
      }
    },
    playing: {
      deps: ['pausetime'],
      fn: function() {
        return !this.pausetime;
      }
    },
    paused: {
      deps: ['pausetime', 'starttime'],
      fn: function() {
        return this.pausetime > this.starttime;
      }
    },
    stopped: {
      deps: ['pausetime', 'starttime'],
      fn: function() {
        return this.pausetime === this.starttime;
      }
    },
    beatprct: {
      deps: ['beatlength', 'frametime'],
      fn: function() {
        var ft = this.frametime;
        var bl = this.beatlength;
        return !ft ? 0 : (100 - (((ft % bl) / bl) * 100));
      }
    },
    beatnum: {
      deps: ['beatlength', 'beatdelay', 'frametime'],
      fn: function() {
        var ft = this.frametime + this.beatdelay;
        return ft ? Math.floor(ft / this.beatlength) : 0;
      }
    },
    beatlength: {
      deps: ['bpm'],
      fn: function() {
        return (60 * 1000) / Math.max(this.bpm, 1);
      }
    }
  },

  props: {
    pausetime: ['number', true, 0],
    starttime: ['number', true, Date.now],
    frametime: ['number', true, 0],
    beatdelay: ['number', true, 0],
    bpm: ['number', true, 120]
  }
});

module.exports = Clock;

/***/ })

});
//# sourceMappingURL=4-build.js.map