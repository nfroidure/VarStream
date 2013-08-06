var VarStream = require('../src/VarStream')
	, fs = require('fs')
	, assert = require('assert');

// Helpers


// Tests
describe('Reading a varstream', function() {

	var scope = {};
	var myVarStream=new VarStream(scope,'vars');

	it("should work for simple datas", function(done) {
		fs.createReadStream(__dirname+'/fixtures/1-simple.dat').pipe(myVarStream)
			.once('end', function () {
				// Numbers
				assert.equal(typeof scope.vars.aSimpleIntValue, 'number');
				assert.equal(scope.vars.aSimpleIntValue,1898);
				assert.equal(typeof scope.vars.aSimpleIntNegativeValue, 'number');
				assert.equal(scope.vars.aSimpleIntNegativeValue,-1669);
				assert.equal(typeof scope.vars.aSimpleFloatValue, 'number');
				assert.equal(scope.vars.aSimpleFloatValue,1.0025);
				assert.equal(typeof scope.vars.aSimpleFloatNegativeValue, 'number');
				assert.equal(scope.vars.aSimpleFloatNegativeValue,-1191.0025);
				// Booleans
				assert.equal(typeof scope.vars.aSimpleBoolValueTrue, 'boolean');
				assert.equal(scope.vars.aSimpleBoolValueTrue,true);
				assert.equal(typeof scope.vars.aSimpleBoolValueFalse, 'boolean');
				assert.equal(scope.vars.aSimpleBoolValueFalse,false);
				// Strings
				assert.equal(typeof scope.vars.aSimpleStringValue, 'string');
				assert.equal(scope.vars.aSimpleStringValue,"I'm the king of the world!");
				assert.equal(typeof scope.vars.aSimpleStringMultilineValue, 'string');
				assert.equal(scope.vars.aSimpleStringMultilineValue,
					"I'm the king of the world!\nYou know!\nIt's true.");
				assert.equal(typeof scope.vars.aSimpleWellDeclaredStringValue, 'string');
				assert.equal(scope.vars.aSimpleWellDeclaredStringValue,
					"I'm the king of the world!");
				assert.equal(typeof scope.vars.aSimpleWellDeclaredStringMultilineValue,
					'string');
				assert.equal(scope.vars.aSimpleWellDeclaredStringMultilineValue,
					"I'm the king of the world!\nYou \"know\"!\nIt's true.");
				done();
			});
	});


	it("should work for data trees", function(done) {
		fs.createReadStream(__dirname+'/fixtures/2-trees.dat').pipe(myVarStream) 
			.once('end', function () {
				assert.equal(typeof scope.vars.treeRoot.branch1,'object');
				assert.equal(scope.vars.treeRoot.branch1.aSimpleIntValue,1898);
				assert.equal(scope.vars.treeRoot.branch1.aSimpleIntNegativeValue,-1669);
				assert.equal(typeof scope.vars.treeRoot.branch2,'object');
				assert.equal(scope.vars.treeRoot.branch2.aSimpleFloatValue,1.0025);
				assert.equal(scope.vars.treeRoot.branch2.aSimpleFloatNegativeValue,
					-1191.0025);
				assert.equal(typeof scope.vars.treeRoot.branch3,'object');
				assert.equal(scope.vars.treeRoot.branch3.aSimpleBoolValueTrue,true);
				assert.equal(scope.vars.treeRoot.branch3.aSimpleBoolValueFalse,false);
				assert.equal(typeof scope.vars.treeRoot.branch3.branch1,'object');
				assert.equal(scope.vars.treeRoot.branch3.branch1.aSimpleNullValue,null);
				assert.equal(scope.vars.treeRoot.branch3.branch1.aSimpleStringValue,
					"I'm the king of the world!");
				assert.equal(typeof scope.vars.treeRoot.branch3.branch2,'object');
				assert.equal(scope.vars.treeRoot.branch3.branch2.aSimpleStringMultilineValue,
					"I'm the king of the world!\nYou know!\nIt's true.");
				assert.equal(scope.vars.treeRoot.branch3.branch2.aSimpleWellDeclaredStringValue,
					"I'm the king of the world!");
				assert.equal(typeof scope.vars.treeRoot.branch3.branch2.branch1,'object');
				assert.equal(
					scope.vars.treeRoot.branch3.branch2.branch1.aSimpleWellDeclaredStringMultilineValue,
					"I'm the king of the world!\nYou \"know\"!\nIt's true.");
				done();
			});
	});


	it("should deleted empty datas", function(done) {
		fs.createReadStream(__dirname+'/fixtures/3-delete.dat').pipe(myVarStream) 
		.once('end', function () {
			assert.equal(typeof scope.vars.treeRoot.branch1.aSimpleIntNegativeValue,'undefined');
			assert.equal(typeof scope.vars.treeRoot.branch2,'undefined');
			assert.equal(typeof scope.vars.treeRoot.branch3.aSimpleBoolValueTrue,'undefined');
			assert.equal(typeof scope.vars.treeRoot.branch3.branch1.aSimpleStringValue,'undefined');
			done();
		});
	});


	it("should take backward references in count", function(done) {
		fs.createReadStream(__dirname+'/fixtures/4-backward.dat').pipe(myVarStream) 
		.once('end', function () {
				assert.equal(typeof scope.vars.treeRoot.branch1,'object');
				assert.equal(scope.vars.treeRoot.branch1.aSimpleIntValue,2000);
				assert.equal(scope.vars.treeRoot.branch1.aSimpleIntNegativeValue,-2000);
				assert.equal(typeof scope.vars.treeRoot.branch2,'object');
				assert.equal(scope.vars.treeRoot.branch2.aSimpleFloatValue,2.0001);
				assert.equal(scope.vars.treeRoot.branch2.aSimpleFloatNegativeValue,-1000.0002);
				assert.equal(typeof scope.vars.treeRoot.branch3,'object');
				assert.equal(scope.vars.treeRoot.branch3.aSimpleBoolValueTrue,true);
				assert.equal(scope.vars.treeRoot.branch3.aSimpleBoolValueFalse,false);
				assert.equal(typeof scope.vars.treeRoot.branch3.branch1,'object');
				assert.equal(scope.vars.treeRoot.branch3.branch1.aSimpleNullValue,null);
				assert.equal(scope.vars.treeRoot.branch3.branch1.aSimpleStringValue,
					"I'm not the king of the world!");
				assert.equal(typeof scope.vars.treeRoot.branch3.branch2,'object');
				assert.equal(scope.vars.treeRoot.branch3.branch2.aSimpleStringMultilineValue,
					"I'm not the king of the world!\nYou know!\nIt's true.");
				assert.equal(scope.vars.treeRoot.branch3.branch2.aSimpleWellDeclaredStringValue,
					"I'm not the king of the world!");
				assert.equal(typeof scope.vars.treeRoot.branch3.branch2.branch1,'object');
				assert.equal(
					scope.vars.treeRoot.branch3.branch2.branch1.aSimpleWellDeclaredStringMultilineValue,
					"I'm not the king of the world!\nYou \"know\"!\nIt's true.");
			done();
		});
	});

	it("should work with operators", function(done) {
		fs.createReadStream(__dirname+'/fixtures/5-operators.dat').pipe(myVarStream) 
		.once('end', function () {
				// Numbers
				assert.equal(typeof scope.vars.aSimpleIntValue, 'number');
				assert.equal(scope.vars.aSimpleIntValue,(((1898+5)*2)-15)%8);
				assert.equal(typeof scope.vars.aSimpleIntNegativeValue, 'number');
				assert.equal(scope.vars.aSimpleIntNegativeValue,(((-1669)+6)*-3)-1);
				assert.equal(typeof scope.vars.aSimpleFloatValue, 'number');
				assert.equal(scope.vars.aSimpleFloatValue,(1.0025+0.0025)/0.0025);
				assert.equal(typeof scope.vars.aSimpleFloatNegativeValue, 'number');
				assert.equal(scope.vars.aSimpleFloatNegativeValue,((-1191.0025)-(-0.0025))/-0.0025);
				// Booleans
				assert.equal(typeof scope.vars.aSimpleBoolValueTrue, 'boolean');
				assert.equal(scope.vars.aSimpleBoolValueTrue,true);
				assert.equal(typeof scope.vars.aSimpleBoolValueFalse, 'boolean');
				assert.equal(scope.vars.aSimpleBoolValueFalse,false);
				// Strings
				assert.equal(typeof scope.vars.aSimpleStringValue, 'string');
				assert.equal(scope.vars.aSimpleStringValue,"I'm the king of the world! Yep!");
				assert.equal(typeof scope.vars.aSimpleStringMultilineValue, 'string');
				assert.equal(scope.vars.aSimpleStringMultilineValue,
					"I'm the king of the world!\nYou know!\nIt's true.\nYep.");
				assert.equal(typeof scope.vars.aSimpleWellDeclaredStringValue, 'string');
				assert.equal(scope.vars.aSimpleWellDeclaredStringValue,
					"I'm the king of the world! Yep!");
				assert.equal(typeof scope.vars.aSimpleWellDeclaredStringMultilineValue,
					'string');
				assert.equal(scope.vars.aSimpleWellDeclaredStringMultilineValue,
					"I'm the king of the world!\nYou \"know\"!\nIt's true.\nYep.");
				assert.equal(scope.vars.treeRoot.branch3.branch4,
					scope.vars.treeRoot.branch3.branch2);
			done();
		});
	});

	it("should work with arrays", function(done) {
		fs.createReadStream(__dirname+'/fixtures/6-arrays.dat').pipe(myVarStream) 
		.once('end', function () {
				// First array
				assert.equal(typeof scope.vars.simpleArray,'object');
				assert.equal(scope.vars.simpleArray instanceof Array,true);
				assert.equal(scope.vars.simpleArray.length,9);
				assert.equal(scope.vars.simpleArray[0],0);
				assert.equal(scope.vars.simpleArray[1],1);
				assert.equal(scope.vars.simpleArray[2],2);
				assert.equal(scope.vars.simpleArray[3],3);
				assert.equal(scope.vars.simpleArray[4],4);
				assert.equal(scope.vars.simpleArray[5],5);
				assert.equal(scope.vars.simpleArray[6],6);
				assert.equal(scope.vars.simpleArray[7],9);
				assert.equal(scope.vars.simpleArray[8],8);
				// Second array
				assert.equal(typeof scope.vars.simpleArray2,'object');
				assert.equal(scope.vars.simpleArray2 instanceof Array,true);
				assert.equal(scope.vars.simpleArray2.length,10);
				assert.equal(scope.vars.simpleArray[0],5);
				assert.equal(scope.vars.simpleArray[1],4);
				assert.equal(typeof scope.vars.simpleArray[2],'undefined');
				assert.equal(typeof scope.vars.simpleArray[3],'undefined');
				assert.equal(typeof scope.vars.simpleArray[4],'undefined');
				assert.equal(typeof scope.vars.simpleArray[5],'undefined');
				assert.equal(typeof scope.vars.simpleArray[6],'undefined');
				assert.equal(typeof scope.vars.simpleArray[7],'undefined');
				assert.equal(typeof scope.vars.simpleArray[8],'undefined');
				assert.equal(scope.vars.simpleArray[9],5);
			done();
		});
	});

	it("Should work with truncated content beetween chunks", function(done) {
		fs.createReadStream(__dirname+'/fixtures/7-truncated-part1.dat').pipe(myVarStream) 
		.once('end', function () {
			//done();
			});
		fs.createReadStream(__dirname+'/fixtures/7-truncated-part2.dat').pipe(myVarStream) 
		.once('end', function () {
			done();
			});
	});

});

describe('Reading bad varstreams', function() {

	it("should raise exceptions when", function() {

		it("a line ends with no =", function(done) {
			try {
				var scope = {};
				var myVarStream=new VarStream(scope,'vars', true);
				myVarStream.read('ASimpleVar\n');
				myVarStream.end();
			} catch(e) {
				done();
			}
		});

		it("a line ends with no =", function(done) {
			try {
				var scope = {};
				var myVarStream=new VarStream(scope,'vars', true);
				myVarStream.read('ASimpleVar\n');
				myVarStream.end();
			} catch(e) {
				done();
			}
		});

		it("a line ends with no value after &=", function(done) {
			try {
				var scope = {};
				var myVarStream=new VarStream(scope,'vars', true);
				myVarStream.read('ASimpleVar\n');
				myVarStream.end();
			} catch(e) {
				done();
			}
		});

		it("a line ends with no value after &=", function(done) {
			try {
				var scope = {};
				var myVarStream=new VarStream(scope,'vars', true);
				myVarStream.read('ASimpleVar&=\n');
				myVarStream.end();
			} catch(e) {
				done();
			}
		});

		it("a line ends with no value after +=", function(done) {
			try {
				var scope = {};
				var myVarStream=new VarStream(scope,'vars', true);
				myVarStream.read('ASimpleVar+=\n');
				myVarStream.end();
			} catch(e) {
				done();
			}
		});

		it("a line ends with no value after -=", function(done) {
			try {
				var scope = {};
				var myVarStream=new VarStream(scope,'vars', true);
				myVarStream.read('ASimpleVar-=\n');
				myVarStream.end();
			} catch(e) {
				done();
			}
		});

		it("a line ends with no value after *=", function(done) {
			try {
				var scope = {};
				var myVarStream=new VarStream(scope,'vars', true);
				myVarStream.read('ASimpleVar*=\n');
				myVarStream.end();
			} catch(e) {
				done();
			}
		});

		it("a line ends with no value after /=", function(done) {
			try {
				var scope = {};
				var myVarStream=new VarStream(scope,'vars', true);
				myVarStream.read('ASimpleVar/=\n');
				myVarStream.end();
			} catch(e) {
				done();
			}
		});

		it("there are a empty node at start", function(done) {
			try {
				var scope = {};
				var myVarStream=new VarStream(scope,'vars', true);
				myVarStream.read('.ASimpleVar=true\n');
				myVarStream.end();
			} catch(e) {
				done();
			}
		});

		it("there are a empty node at start", function(done) {
			try {
				var scope = {};
				var myVarStream=new VarStream(scope,'vars', true);
				myVarStream.read('ASimpleVar.prop..prop.prop=true\n');
				myVarStream.end();
			} catch(e) {
				done();
			}
		});

		it("there are a empty node at end", function(done) {
			try {
				var scope = {};
				var myVarStream=new VarStream(scope,'vars', true);
				myVarStream.read('ASimpleVar.=false\n');
				myVarStream.end();
			} catch(e) {
				done();
			}
		});

		it("there are malformed nodes", function(done) {
			try {
				var scope = {};
				var myVarStream=new VarStream(scope,'vars', true);
				myVarStream.read('ASimp-+leVar.ds+d=false\n');
				myVarStream.end();
			} catch(e) {
				done();
			}
		});

		it("there are backward reference on an empty scope", function(done) {
			try {
				var scope = {};
				var myVarStream=new VarStream(scope,'vars', true);
				myVarStream.read('^.test=true\n');
				myVarStream.end();
			} catch(e) {
				done();
			}
		});

		it("there are out of range backward reference", function(done) {
			try {
				var scope = {};
				var myVarStream=new VarStream(scope,'vars', true);
				myVarStream.read('ASimpleVar.prop1.prop2=false\n^4.test=true\n');
				myVarStream.end();
			} catch(e) {
				done();
			}
		});

		it("there are malformed backward reference", function(done) {
			try {
				var scope = {};
				var myVarStream=new VarStream(scope,'vars', true);
				myVarStream.read('ASimpleVar.prop1.prop2=false\n^4b.test=true\n');
				myVarStream.end();
			} catch(e) {
				done();
			}
		});

		it("there are malformed backward reference2", function(done) {
			try {
				var scope = {};
				var myVarStream=new VarStream(scope,'vars', true);
				myVarStream.read('ASimpleVar.prop1.prop2=false\n^b5.test=true\n');
				myVarStream.end();
			} catch(e) {
				done();
			}
		});

	});

});
