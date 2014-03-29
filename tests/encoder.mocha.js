var VarStream = require('../src/VarStream')
  , fs = require('fs')
  , assert = require('assert')
  , StringDecoder = require('string_decoder').StringDecoder;

// Tests
describe('Writing bad varstreams', function() {

  describe("should raise exceptions when in strict mode and", function() {

    it("the given root object is not an object or an array", function() {
      assert.throws(
        function() {
          new VarStream.Writer(function() {},
            VarStream.Reader.STRICT_MODE).write('');
        },
        function(err) {
        if(err instanceof Error
          &&err.message==='The root scope must be an Object or an Array.') {
            return true;
          }
        }
      );
    });

  });

});
