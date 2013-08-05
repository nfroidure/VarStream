var VarStream = require('../VarStream');
var fs = require('fs');

var scope, myVarStream;
if(process.argv[2])
	{
	if(process.argv[3])
		{
		fs.readFile(__dirname+'/'+process.argv[2], function read(err, data)
			{
			if (err) { throw err; }
			scope=JSON.parse(data);
			myVarStream=new VarStream(scope, true);
			myVarStream.pipe(fs.createWriteStream(__dirname+"/"+process.argv[2].split('.')[0]+".dat"));
			console.log("Saved!");
			});
		}
	else
		{
		scope = {};
		myVarStream=new VarStream(scope, true);
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
	}
else
	console.log('No file input. Usage: node make_json.js file');