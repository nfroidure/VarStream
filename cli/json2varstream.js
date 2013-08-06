var VarStream = require('../src/VarStream'),
	fs = require('fs');

if(process.argv[2]) {
		var scope={}, myVarStream;
		// Reading the file
		fs.readFile(process.argv[2], function read(err, data) {
			if (err) { console.error('Unable to read the input file (err:'+err+').'); }
			// Parsing the JSON datas
			try {
				scope.vars=JSON.parse(data);
			} catch (e) {
				console.error('Bad JSON file (err:'+e+').');
			}
			// Creating the varstream
			myVarStream=new VarStream(scope, 'vars', true);
			// Creating the write stream
			var wS = fs.createWriteStream(process.argv[3]||'/dev/stdout');
			wS.on('error', function(err) {
				console.error('Unable to write to the ouput file: '+err);
			});
			wS.on('open', function() {
				process.argv[3]&&console.log('Output file successfully opened/created.');
			});
			// Piping it to the ouput file
			myVarStream.pipe(wS);
			myVarStream.on('close', function() {
				process.argv[3]&&console.log("Saved!");
			});
		});
} else {
	console.log('Usage: '+process.argv[0]+' '+process.argv[1]+' path/to/input.json path/to/output.dat');
}
