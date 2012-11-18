var VarStream = require('../VarStream');
var fs = require('fs');

var scope = {};
var myVarStream=new VarStream(scope, true);
if(process.argv[2])
	{
	fs.createReadStream(__dirname+'/'+process.argv[2]).pipe(myVarStream) 
	  .on('end', function () {
		console.log(scope);
		fs.writeFile(__dirname+"/"+process.argv[2].split('.')[0]+".json", JSON.stringify(scope), function(err) {
			if(err) {
				console.log(err);
			} else {
				console.log("Saved!");
			}
		});
		});
	}
else
	console.log('No file input. Usage: node make_json.js file');