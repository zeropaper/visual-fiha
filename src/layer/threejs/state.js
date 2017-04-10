'use strict';
var ScreenLayerState = require('./../state');
var State = require('ampersand-state');
var Collection = require('ampersand-collection');



/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/

var ThreeState = State.extend({});


function makeCollectionModel(StateKind) {
  return function(attrs, opts) {
    var Constructor = StateKind.types[attrs.type] || StateKind;
    var state = new Constructor(attrs, opts);
    return state;
  };
}



/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/
var MaterialState = State.extend({});

MaterialState.types = {};



var MaterialCollection = Collection.extend({
  mainIndex: 'name',
  model: makeCollectionModel(MaterialState)
});



/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/
var ObjectState = ThreeState.extend({});

ObjectState.types = {};



var ObjectCollection = Collection.extend({
  mainIndex: 'name',
  model: makeCollectionModel(ObjectState)
});



/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/
var LightState = ThreeState.extend({});

LightState.types = {};



var LightCollection = Collection.extend({
  mainIndex: 'name',
  model: makeCollectionModel(LightState)
});



/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/
var CameraState = ThreeState.extend({});

CameraState.types = {};



var CameraCollection = Collection.extend({
  mainIndex: 'name',
  model: makeCollectionModel(CameraState)
});



/***************************************\
 *                                     *
 *                                     *
 *                                     *
\***************************************/
module.exports = ScreenLayerState.types.threejs = ScreenLayerState.extend({
  props: {
    src: ['string', false, null],
    renderFunction: ['string', true, 'function() { console.info(\'missing renderFunction for %s\', layer.model.getId()); }'],
    updateFunction: ['string', true, 'function() { console.info(\'missing updateFunction for %s\', layer.model.getId()); }']
  },

  collections: {
    parameters: ScreenLayerState.PropertyCollection,
    styleProperties: ScreenLayerState.PropertyCollection,
    objects: ObjectCollection,
    lights: LightCollection,
    cameras: CameraCollection,
    materials: MaterialCollection
  }
});