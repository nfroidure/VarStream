#! /usr/bin/env node

var VarStream = require('../src/VarStream'),
	fs = require('fs');

if(process.argv[2]) {
		var scope={}, myVarStream;
		myVarStream=new VarStream(scope, 'vars', VarStream.VarStreamReader.STRICT_MODE);
		var rS=fs.createReadStream(process.argv[2]);
		rS.on('error', function(err) {
			console.error('Unable to read to the input file: '+err);
		});
		rS.pipe(myVarStream)
		  .on('end', function () {
				fs.writeFile(process.argv[3]||'/dev/stdout',
					JSON.stringify(scope.vars), function(err) {
						if(err) {
							console.error(err);
						} else {
							process.argv[3]&&console.log("Saved!");
						}
				});
			});
} else {
	console.log('Usage: '+process.argv[0]+' '+process.argv[1]
		+' path/to/input.dat path/to/output.json');
}
