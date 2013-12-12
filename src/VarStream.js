'use strict';
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
var DuplexStream = require('stream').Duplex
  , util = require('util')
  , VarStreamReader=require('./VarStreamReader')
  , VarStreamWriter=require('./VarStreamWriter')
  ;

// Inherit of duplex stream
util.inherits(VarStream, DuplexStream);

// Constructor
function VarStream(rootObject, rootProperty, options) {
  var self = this;

  // Ensure new were used
  if(!(this instanceof VarStream)) {
    throw Error('Please use the "new" operator to instanciate a VarStream.');
  }

  // Ensure we had root object and property
  if(!(rootObject instanceof Object)) {
    throw Error('No root object provided.');
  }
  if('string' !== typeof rootProperty) {
    throw Error('No root property name given.');
  }

  // Parent constructor
  DuplexStream.call(this);

  this._varstreamReader=new VarStreamReader(rootObject, rootProperty,
    options ? options&VarStreamReader.OPTIONS : 0);

  this._varstreamWriter = new VarStreamWriter(function(str) {
      self.push(new Buffer(str, 'utf8'));
  }, options ? options&VarStreamWriter.OPTIONS : 0);

  // Parse input
  this._write = function _write(chunk, encoding, done) {
    var str = '';
    if(Buffer.isBuffer(chunk)) {
      str = chunk.toString(encoding !== 'buffer' ? encoding : 'utf8');
    } else {
      str = chunk;
    }
    this._varstreamReader.read(str);
    done();
  };

  // Output data
  this._read = function _read() {
    this._varstreamWriter.write(rootObject[rootProperty]);
    this.push(null);
  };

};

// Exporting
VarStream.VarStreamReader=VarStreamReader;
VarStream.VarStreamWriter=VarStreamWriter;
module.exports = VarStream;
