'use strict';
describe('Mapping Service', function() {
  function warn(e) {console.warn(e);}

  var mappings, structure, VFDeps, State, Collection, TestState, PropState, info, instance;

  function newStructure(data) {
    data = data || {
      propA: new PropState({id: 'instA', propName: 'prop a'}),
      propB: new PropState({id: 'instB', propName: 'prop b'}),

      childA: {id: 'instA', propName: 'child a', altPropName: 'alt a'},
      childB: {id: 'instB', propName: 'child b'},

      collectionA: [
        {id: 'inst1', propName: 1},
        {id: 'inst2', propName: 2},
        {id: 'inst3', propName: 3}
      ],
      collectionB: [
        {id: 'inst1', propName: 1},
        {id: 'inst2', propName: 2},
        {id: 'inst3', propName: 3}
      ]
    };

    mappings.reset([]);

    return new TestState(data);
  }

  before(function (done) {
    function createModels() {
      PropState = State.extend({
        props: {
          id: ['any', false, true],
          propName: ['any', false, null],
          altPropName: ['any', false, null]
        },

        mappable: {
          source: ['propName'],
          target: ['altPropName']
        }
      });


      TestState = State.extend({
        mappable: {
          source: ['propA', 'propB', 'childA', 'collectionA'],
          target: ['propA', 'propB', 'childB', 'collectionB']
        },

        children: {
          childA: PropState,
          childB: PropState
        },

        props: {
          propA: ['state', false, null],
          number1: 'number'
        },

        session: {
          propB: ['state', false, null],
          number2: 'number'
        },

        collections: {
          collectionA: Collection.extend({
            model: PropState
          }),

          collectionB: Collection.extend({
            model: PropState
          })
        }
      });

      structure = newStructure();

      done();
    }

    if (typeof R === 'undefined') {
      VFDeps = require('./../../deps-build');
      Collection = VFDeps.Collection;
      State = VFDeps.State;
      mappings = require('./../../src/mapping/state');
      return createModels();
    }
    R(function (require) {
      VFDeps = window.VFDeps;
      Collection = VFDeps.Collection;
      State = VFDeps.State;
      mappings = require('./../src/mapping/state');
    }, createModels);
  });

  it('provides a collection instance as a service', function() {
    expect(mappings.isCollection).to.be(true);
  });



  describe('service.resolve()', function() {
    var instance, info;

    before(function() {
      structure = newStructure();

      info = {
        sourceObject: structure.childA,
        sourceProperty: 'propName',

        targetObject: structure.collectionA.get('inst1'),
        targetProperty: 'propName'
      };

      instance = new mappings.model(info);
    });

    it('retrieves a value from a path', function() {
      var sourceValue = instance.resolve('childA.propName', structure);
      expect(sourceValue).to.be('child a');

      var targetValue = instance.resolve('collectionA.inst1.propName', structure);
      expect(targetValue).to.be('child a');
    });
  });



  describe('service.add()', function() {
    before(function () {
      structure = newStructure();

      info = {
        sourceObject: structure.childA,
        sourceProperty: 'propName',

        targetObject: structure.collectionA.get('inst1'),
        targetProperty: 'propName',

        transformation: 'function(t) { return t; }'
      };

      instance = new mappings.model(info);
    });

    it('requires valid data`', function() {
      var add = mappings.add.bind(mappings);
      expect(add).withArgs({}).to.throwException();
      expect(add).withArgs(info).not.to.throwException(warn);
    });

    it('determines a sourcePath', function () {
      expect(instance.sourcePath).to.be('childA.propName');
    });

    it('determines a targetPath', function () {
      expect(instance.targetPath).to.be('collectionA.inst1.propName');
    });

    it('determines a sourceValue', function () {
      expect(instance.sourceValue).to.be('child a');
    });

    it('determines a targetValue', function () {
      expect(instance.targetValue).to.be('child a');
    });

    it('has a function to transform values', function () {
      expect(instance.transformation).to.be.a('string');
      expect(instance.transformationFunction).to.be.a('function');
    });
  });




  describe('service.import()', function() {
    before(function() {
      structure = newStructure();

      info = [
        {
          source: 'childB.propName',
          target: 'collectionB.inst2.propName',
          transform: 'function(t) { return t + t; }'
        }
      ];
    });

    it('resolves the paths', function() {
      expect(mappings.import.bind(mappings)).withArgs(info, structure).not.to.throwException(warn);
    });

    it('produces the transformationFunction', function() {
      var mapping, transformationFunction;
      expect(function() {
        mappings.reset();
        mappings.import(info, structure);
        mapping = mappings.at(0);
        transformationFunction = mapping.transformationFunction;
      }).not.to.throwException(warn);

      expect(mapping.transformation).to.be.a('string');
      expect(transformationFunction).to.be.a('function');

      var res = mapping.transformationFunction('a');
      expect(res).to.be('aa');

      res = mapping.transformationFunction(1);
      expect(res).to.be(2);
    });
  });




  describe('service.export()', function() {
    var exported;

    before(function() {
      structure = newStructure();

      mappings.add({
        sourceObject: structure.childA,
        sourceProperty: 'propName',

        targetObject: structure.collectionA.get('inst1'),
        targetProperty: 'propName',

        transformation: function(f) { return f; }
      });

      exported = mappings.export();
    });

    it('returns a stringifiable array', function() {
      expect(exported).to.have.length(1);
      expect(JSON.stringify).withArgs(exported).not.to.throwException(warn);
    });

    it('includes all information to restore a mapping', function() {
      expect(exported[0].source).to.be('childA.propName');
      expect(exported[0].target).to.be('collectionA.inst1.propName');
      expect(exported[0].transform).to.be('function (f) { return f; }');
    });
  });




  describe('mapping.sourceProperty value change', function() {
    var info, instance;

    before(function () {
      structure = newStructure();

      info = {
        sourceObject: structure.childA,
        sourceProperty: 'propName',
        targetObject: structure.collectionA.get('inst1'),
        targetProperty: 'propName'
      };

      instance = new mappings.model(info);
      instance.sourceProperty = 'altPropName';
    });

    it('updates sourceValue', function () {
      expect(instance.sourceValue).to.be('alt a');
    });

    it('updates targetValue', function () {
      expect(instance.targetValue).to.be('alt a');
    });
  });




  describe('mapping.sourceObject state property value change', function() {
    var info, instance;

    before(function () {
      structure = newStructure();

      info = {
        sourceObject: structure.childB,
        sourceProperty: 'propName',
        targetObject: structure.collectionB.get('inst1'),
        targetProperty: 'propName'
      };

      instance = new mappings.model(info);
      structure.childB.propName = 'alta';
    });

    it('updates sourceValue', function () {
      expect(instance.sourceValue).to.be('alta');
    });

    it('updates targetValue', function () {
      expect(instance.targetValue).to.be('alta');
    });
  });




  describe('mapping.targetObject change', function() {
    var info, instance;

    before(function () {
      structure = newStructure();

      info = {
        sourceObject: structure.childA,
        sourceProperty: 'propName'
      };

      instance = new mappings.model(info);
    });

    it('has an empty string if it has no targetObject', function () {
      expect(instance.targetPath).to.be(null);
    });

    it('has an empty targetValue', function () {
      expect(instance.targetValue).to.be(null);
    });

    it('determines a targetPath', function () {
      instance.targetObject = structure.collectionA.get('inst1');
      instance.targetProperty = 'propName';
      expect(instance.targetPath).to.be('collectionA.inst1.propName');
    });

    it('has a targetValue', function () {
      instance.targetObject = structure.collectionA.get('inst1');
      instance.targetProperty = 'propName';
      expect(instance.targetValue).to.be('child a');
    });
  });




  describe('mapping.transformation change', function() {
    var info, instance;

    before(function () {
      structure = newStructure();

      info = {
        sourceObject: structure.childA,
        sourceProperty: 'propName',
        targetObject: structure.collectionA.get('inst1'),
        targetProperty: 'propName'
      };

      instance = new mappings.model(info);
    });

    it('does not affect the targetValue', function () {
      expect(instance.targetValue).to.be('child a');
    });

    it('transforms the targetValue', function () {
      instance.transformation = function(v) { return v + ' ' + v; };
      expect(instance.targetValue).to.be('child a child a');
    });
  });



  describe('service.sourceSuggestions()', function() {
    var suggestions;
    before(function () {
      structure = newStructure();
    });


    it('lists the possible signal sources of an object', function() {
      expect(function() {
        suggestions = mappings.sourceSuggestions(structure);
      }).not.to.throwException(warn);
      console.info('suggestions', suggestions);
    });
  });



  describe('target.targetSuggestions()', function() {
    var suggestions;
    before(function () {
      structure = newStructure();
    });


    it('lists the possible signal targets of an object', function() {
      expect(function() {
        suggestions = mappings.targetSuggestions(structure);
      }).not.to.throwException(warn);
      console.info('suggestions', suggestions);
    });
  });
});