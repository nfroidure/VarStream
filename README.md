VarStream
============

VarStream is a variable exchange format designed to replace JSON for situations when it reaches its limits. VarStream has many advantages :
- Human readable/writeable : no need to be a programmer to create VarStreams datas.
- Streamable : No need to wait the datas to be fully loaded to populate/access your program variables (usefull for configuration files and localization files merging, web sockets realtime var loading ...).
- Self referencable : you can refer to another variable of the stream in the stream itself, wich is not possible with JSON.

VarStream program is free to use for any purpose (GNU/GPL), VarStream format is royalty free, i pushed it in the public domain. French speaking developpers can get a introduction to VarStreams here : http://www.insertafter.com/articles-remplacer_json_par_varstream.html . English version will come soon.

How to use
-------------

NodeJs :
<pre>
var VarStream = require('varstream');
var fs = require('fs');

var scope = {}; // The scope in wich i want vars to be loaded
var myVarStream=new VarStream(scope, true);
fs.createReadStream('test.dat').pipe(myVarStream) // Reading var stream from a ReadStream
  .on('end', function () {
	console.log(scope);
	myVarStream.pipe(fs.createWriteStream('test2.dat')); // Piping VarStream to a WriteStream
	});
</pre>

Browser :
<pre>
var myScope={};
var myStreamReader=new VarStreamReader(myScope,true); // May use XHR to load VarStreams
myStreamReader.read(''); // Reading empty chunk
myStreamReader.read('#comment'); // This is a comment
myStreamReader.read('# Database'
 +'database.type=mysql'+"\n"
 +'database.hosts.+.domain=mysql1.example.com'+"\n"
 +'database.hosts.*.master=true'+"\n"
 +'database.hosts.+.domain=mysql2.example.com'+"\n"
 +'".master=false'+"\n"
 +'database.hosts.+&=database.hosts.0'+"\n"
 +'database.hosts.+.domain&=database.hosts.*.domain'+"\n"); // A more complicated chunk
console.log(myScope.database.hosts[0].domain); // prints mysql1.example.com
console.log(myScope.database.hosts[1].domain); // prints mysql2.example.com
console.log(myScope.database.hosts[2].domain); // prints mysql1.example.com
console.log(myScope.database.hosts[3].domain); // prints mysql2.example.com
</pre>

Contributors
-------------
* Nicolas Froidure - @nfroidure

License
-------
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program.  If not, see <http://www.gnu.org/licenses/>
