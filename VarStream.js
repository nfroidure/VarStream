/*
 * Copyright (C) 2012 Nicolas Froidure
 *
 * This file is free software;
 * you can redistribute it and/or modify it under the terms of the GNU
 * General Public License (GPL) as published by the Free Software
 * Foundation, in version 3. It is distributed in the
 * hope that it will be useful, but WITHOUT ANY WARRANTY of any kind.
 *
 * This object is reserved for NodeJs usage only
 *
 */
var Stream = require('stream').Stream
  , util = require('util')
  , VarStreamReader=require('./VarStreamReader')
  , VarStreamWriter=require('./VarStreamWriter')
  ;

var VarStream=function(scope,debug)
	{
	this.readable=this.writable=(scope?true:false);
	this.scope=scope;
	this.reader=new VarStreamReader(scope,debug);
	};
util.inherits(VarStream, Stream);
// Write part
VarStream.prototype.write = function(data, encoding)
	{
    if (Buffer.isBuffer(data))
		{
		data = data.toString(encoding || 'utf8');
		}
	this.reader.read(data);
	}
VarStream.prototype.end = function()
	{
	this.emit('end');
	}
VarStream.prototype.destroySoon = function()
	{
	}
	// No error event throwed yet
	// So no drain event throwed yet
// Read part
VarStream.prototype.setEncoding = function()
	{
	}
VarStream.prototype.pause = function()
	{
	}
VarStream.prototype.resume = function()
	{
	}
VarStream.prototype.pipe = function(writeStream)
	{
	var self=this;
	var writer=new VarStreamWriter(function(data)
		{
		writeStream.write(data,'utf8');
		}
		, true, true, true);
	writer.write(this.scope);
	}
// Common
VarStream.prototype.destroy = function()
	{
	}

// Exporting
VarStream.prototype.VarStreamReader=VarStreamReader;
VarStream.prototype.VarStreamWriter=VarStreamWriter;
module.exports = VarStream;