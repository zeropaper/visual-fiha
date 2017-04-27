'use strict';
var ScreenLayerState = require('./../state');
var State = require('ampersand-state');
var Collection = require('ampersand-collection');
var ParameterCollection = require('./../../parameter/collection');

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