describe('Mappings', function() {
  'use strict';
  function warn(e) {console.warn(e.stack);}
  var expect = require('expect.js');
  var Mappings = require('./../../src/mapping/data');

  it('requires a context option when instanciated', function() {
    expect(function() {
      new Mappings([], {});
    }).to.throwException();

    expect(function() {
      new Mappings([], {
        context: {}
      });
    }).not.to.throwException();
  });


  describe('collection', function() {
    var mappings;
    beforeEach(function() {
      mappings = new Mappings([], {
        context: {
        }
      });
    });


  });

  describe('state', function() {

  });
});