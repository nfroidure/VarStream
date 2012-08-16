// Websockets management largely inpired from : http://martinsikora.com/nodejs-and-websocket-simple-chat-tutorial

var VarStream = require('./VarStream');
var fs = require('fs');

var scope = {};

var myVarStream=new VarStream(scope, true);

fs.createReadStream('test.dat').pipe(myVarStream) 
  .on('end', function () {
	console.log(scope);
	myVarStream.pipe(fs.createWriteStream('test2.dat'));
	});