var VarStream = require('../VarStream');
var fs = require('fs');
var expect = require('chai').expect;

function read_stream_1 (scope) {
  return function (done) {
	var myVarStream=new VarStream(scope);
	fs.createReadStream('pass-1.dat').pipe(myVarStream) 
	.on('end', function () {
		expect(scope.aaaSimpleIntValue).to.eql(1);
		expect(scope.aaaSimpleBoolValue).to.eql(true);
		expect(scope.aaaSimpleFloatValue).to.eql(1.0025);
		expect(scope.aaaSimpleVarcharValue).to.eql("I'm the king of the world !");
		done();
		});
	};
}

describe('Read stream', function () {
	var scope = {};
	it('should read stream sample #1', read_stream_1(scope));
});