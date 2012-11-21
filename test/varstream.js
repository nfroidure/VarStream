var VarStream = require('../VarStream');
var fs = require('fs');
var expect = require('chai').expect;

function read_stream_1 (scope,myVarStream) {
  return function (done) {
	fs.createReadStream(__dirname+'/fixtures/pass-1.dat').pipe(myVarStream) 
	.once('end', function () {
		expect(scope.aaaSimpleIntValue).to.eql('1');
		expect(scope.aaaSimpleBoolValue).to.eql(true);
		expect(scope.aaaSimpleFloatValue).to.eql('1.0025');
		expect(scope.aaaSimpleVarcharValue).to.eql("I'm the king of the world !");
		done();
		});
	};
}

function read_stream_2 (scope,myVarStream) {
  return function (done) {
	fs.createReadStream(__dirname+'/fixtures/pass-2.dat').pipe(myVarStream) 
	.once('end', function () {
		expect(scope.aaaSimpleIntValue).to.eql('2');
		expect(scope.aaaSimpleBoolValue).to.eql(false);
		expect(scope.aaaSimpleFloatValue).to.eql('1.0026');
		expect(scope.aaaSimpleVarcharValue).to.eql("I'm the king of the world ! Flop.");
		expect(scope.aaSimpleTree.branch1).to.eql("value1");
		expect(scope.aaSimpleTree.branch2).to.eql("value2");
		expect(scope.aaSimpleTree.branch3).to.eql("value3");
		expect(scope.aaSimpleTree.branch4).to.eql("value4");
		expect(scope.aaSimpleTree.branch5).to.eql("value5");
		done();
		});
	};
}

function read_stream_3 (scope,myVarStream) {
  return function (done) {
	fs.createReadStream(__dirname+'/fixtures/pass-3.dat').pipe(myVarStream) 
	.once('end', function () {
		expect(scope.aaSimpleTree.branch6).to.eql("value6");
		expect(scope.aaSimpleTree.branch7).to.eql("value7");
		expect(scope.aaSimpleTree.branch8).to.eql("value8");
		expect(scope.aSimpleArray[0].test.test).to.eql("Good !");
		expect(scope.aSimpleArray[1].test.test).to.eql("Good 1 !");
		expect(scope.aSimpleArray[1].test2.test).to.eql("Good 1 !");
		expect(scope.aSimpleArray[2].test.test).to.eql("Good pop 2 !");
		expect(scope.bMultilineValue).to.eql("a line\nanother line\nyet another line");
		expect(scope.bMultilineValue2).to.eql("a line\nanother line\nyet another line\n");
		done();
		});
	};
}

function read_stream_4 (scope,myVarStream) {
  return function (done) {
	fs.createReadStream(__dirname+'/fixtures/pass-4.dat').pipe(myVarStream) 
	.once('end', function () {
		expect(scope.bMultilineValue2).to.eql("a line\nanother line\nyet another line\na next chunk line\nanother next chunk line");
		expect(scope.aSimpleArray[0].test.test).to.eql("Good reset !");
		expect(scope.aSimpleArray[1]).to.eql(undefined);
		done();
		});
	};
}

function read_stream_5 (scope,myVarStream) {
  return function (done) {
	fs.createReadStream(__dirname+'/fixtures/pass-5.dat').pipe(myVarStream) 
	.once('end', function () {
		expect(scope.aSimpleArray[0].test.test).to.eql("Good !");
		expect(scope.aSimpleArray[1].test.test).to.eql("Good 1 !");
		expect(scope.aSimpleArray[1].test2.test).to.eql("Good 1+ !");
		expect(scope.aSimpleArray[2].test.test).to.eql("Good pop 2 !");
		expect(scope.aSimpleArray[2].test2.test).to.eql("Good pop 2+ !");
		expect(scope.aSimpleArray[3].test.test).to.eql("Good !");
		done();
		});
	};
}

function read_stream_6 (scope,myVarStream) {
  return function (done) {
	fs.createReadStream(__dirname+'/fixtures/pass-6.dat').pipe(myVarStream) 
	.once('end', function () {
		console.log(scope.aSimpleArray[5]);
		expect(scope.aSimpleArray[4].test.test).to.eql("Final pop modified !");
		expect(scope.aSimpleArray[5].test.test).to.eql("New final pop !");
		expect(scope.aSimpleArray[6].test.test).to.eql("New final pop modified !");
		done();
		});
	};
}

function read_stream_fail (scope,myVarStream) {
  return function (done) {
	fs.createReadStream(__dirname+'/fixtures/fail.dat').pipe(myVarStream) 
	.once('end', function () {
		expect(scope.aSimpleArray[8]).to.eql(undefined);
		done();
		});
	};
}

describe('Read stream', function () {
	var scope = {};
	var myVarStream=new VarStream(scope, true);
	it('should read stream sample #1', read_stream_1(scope,myVarStream));
	it('should read stream sample #2', read_stream_2(scope,myVarStream));
	it('should read stream sample #3', read_stream_3(scope,myVarStream));
	it('should read stream sample #4', read_stream_4(scope,myVarStream));
	it('should read stream sample #5', read_stream_5(scope,myVarStream));
	it('should read stream sample #6', read_stream_6(scope,myVarStream));
	it('should read stream that fails', read_stream_fail(scope,myVarStream));
});