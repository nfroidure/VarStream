# VarStream   [![Build Status](https://travis-ci.org/nfroidure/VarStream.png?branch=master)](https://travis-ci.org/nfroidure/VarStream)

VarStream is a variable storage and exchange format. VarStream :
- is human readable/writeable : no need to be a programmer to create VarStreams.
- is streamable : No need to wait the datas to be fully loaded to
 populate/access your program variables.
- keeps backward references: you can refer to another variable of the stream
 in the stream itself.
- merges with no loss: you can easily merge multiple varstreams.
- is light: due to it's smart optimizations and syntax sugar.
- is memory efficient: the garbage collector can cleanup memory before the parse
 ends, backward references prevent data duplication.
- accept comments: keep your configuration/localization files readable.
- loves circular references: transmit your variable trees with no hack.

## Use cases

### Smarter configuration files
VarStream allows you to configure your projects in a clear and readable way.
 Since VarStream is merge friendly, it is particularly usefull for loading
 multilevel configuration files without erasing previously set contents.

Imagine this sample configuration file:

``̀`varstream
# Server
server.domain=example.com
server.protocols.+=http
server.protocols.+=https
server.databases.+.host=db1.example.com
server.databases.*.username=db1
server.databases.+.host=db2.example.com
server.databases.*.username=db2
server.cache.size=2048
# HTML document
document.scripts.+.uri=//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js
document.scripts.+.uri=//ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js


```
You could easily override some of its contents by loading this specific
 configuration file next to him:
``̀`varstream
# Append my custom dev TLD
server.domain+=.local
# Support 1 more protocol
server.protocols.+=ws
# Reset DB and set my local one
server.databases.!.host=localhost
server.databases.*.username=db1
# Increase cache size (8 times)
server.cache.size*=8
# Use local scripts
document.scripts.0.uri=javascript/jquery.js
document.scripts.1.uri=javascript/jquery-ui.js
```
The same goes for internationalization files. You could load a language file and
 augment it with a locale file.

### Sharing variable trees in realtime
VarStreams particularly suits with the JavaScript messaging systems. Communicate
 throught different JavaScript threads (or over the Network) has never been so
 simple.

This is particularly usefull for data driven applications.

## Test it !
- [draw content before its full load](http://server.elitwork.com/experiments/pagestream/index.html).
- [loading charts progressively](http://server.elitwork.com/experiments/chartstream/index.html).
- [maintain a variable tree beetween many processes with web sockets] (https://github.com/nfroidure/WebSockIPC)
- claim yours !

## Performances
Compared to JSON, VarStreams brings nice formatting with often less weight.
- test1 : linear.dat [390 bytes] vs linear.json [423 bytes] => 8% smaller
- test2 : arrays.dat [1244 bytes] vs arrays.json [1178 bytes] => 6% bigger
- test3 : references.dat [2844 bytes] vs references.json [3314 bytes] => 16% smaller

## How to use
With NodeJs :
```js
var VarStream = require('varstream');
var fs = require('fs');

var scope = {}; // The root scope
var myVarStream=new VarStream(scope, 'prop');
// Reading var stream from a file
fs.createReadStream('test.dat').pipe(myVarStream)
  .on('end', function () {
  // Piping VarStream to a file
	myVarStream.pipe(fs.createWriteStream('test2.dat'));
	});
```

In the browser, you can use browserify or directly VarStreamReader and
 VarStreamWriter constructors.

## CLI Usage
VarStream comes with two CLI utilities, to use them, install VarStream globally :
```sh
npm install -g varstream
# Convert JSON datas to VarStream
json2varstream path/to/input.json > path/to/ouput.dat
# Convert VarStreams datas to JSON
varstream2json path/to/input.dat > path/to/ouput.json
```

## Contributing/Testing
The VarStream JavaScript library is fully tested. If you want to contribute,
 test your code before submitting, just run the following command with
 NodeJS dependencies installed :
```js
npm test
```

## Contributors
* Nicolas Froidure - @nfroidure

## License
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>
