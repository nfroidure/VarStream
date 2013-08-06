/*
 * Copyright (C) 2012 Nicolas Froidure
 *
 * This file is free software;
 * you can redistribute it and/or modify it under the terms of the GNU
 * General Public License (GPL) as published by the Free Software
 * Foundation, in version 3. It is distributed in the
 * hope that it will be useful, but WITHOUT ANY WARRANTY of any kind.
 *
 * This object is NodeJs independent
 *
 * Important warning ! Should evaluate the right member first in case of backward referencing with * or + in the two sides
 *
 */

// AMD + global + NodeJS : You can use this object by inserting a script
// or using an AMD loader (like RequireJS) or using NodeJS
(function(root,define){ define([], function() {
// START: Module logic start

	// Constructor
	function VarStreamReader (scope,strictMode) {
		// Keep a ref to the root scope
		this.rootScope=scope;
		// Save the strictMode param
		this.strictMode=(strictMode?strictMode:false);
		// Store current scopes for backward references
		this.currentScopes=new Array();
		// The current readed var
		this.currentVar=new Array();
		// The parse state
		this.state=PARSE_NEWLINE; // Marker to know if the next chunk begins by a multine value
		// The current values
		this.leftValue='';
		this.rightValue='';
		this.operator='';
		this.escaped=false;
	}

	// Constants
		// Chars
	var CHR_ENDL = '\n'
		, CHR_CR = '\r'
		, CHR_SEP = '.'
		, CHR_BCK = '^'
		, CHR_EQ = '='
		, CHR_ESC = '\\'
		, CHR_PLU = '+'
		, CHR_MIN = '-'
		, CHR_MUL = '*'
		, CHR_DIV = '/'
		, CHR_MOD = '%'
		, CHR_REF = '&'
		, CHR_NEW = '!'
		, CHR_COM = '#'
		// Chars sets
		, EQ_OPS = [CHR_PLU,CHR_MIN,CHR_MUL,CHR_DIV,CHR_MOD,CHR_REF]
		, ARRAY_OPS = [CHR_PLU,CHR_MUL,CHR_NEW]
		, NODE_CHARS = /^[a-zA-Z0-9\^\.]$/
		// Parsing status
		, PARSE_NEWLINE = 1
		, PARSE_LVAL = 2
		, PARSE_RVAL = 3
		, PARSE_OPERATOR = 4
		, PARSE_MLSTRING = 5
		, PARSE_COMMENT = 6
		, PARSE_SILENT = 7
		;

	VarStreamReader.prototype.read = function (chunk) {
		// Looping throught chunk chars
		for(var i=0, j=chunk.length; i<j; i++) {
			// detect escaped chars
			if(chunk[i]===CHR_ESC
				&&(
					this.state===PARSE_RVAL
					||this.state===PARSE_SILENT
					||this.state===PARSE_MLSTRING
					)
				) {
				if(this.escaped) {
					this.escaped=false;
				} else {
					this.escaped=true;
					continue;
				}
			}
			// parsing chars according to the current state
			switch(this.state) {
				// Continue while newlines
				case PARSE_NEWLINE:
					this.escaped=false;
					this.operator='';
					this.leftValue='';
					this.rightValue='';
					if(chunk[i]===CHR_ENDL||chunk[i]===CHR_CR) {
						continue;
					}
				// Read left value content
				case PARSE_LVAL:
					// Detect comments
					if(chunk[i]===CHR_COM) {
						this.state=PARSE_COMMENT;
						continue;
					}
					// Detect special operators
					if(-1!==EQ_OPS.indexOf(chunk[i])) {
						this.state=PARSE_OPERATOR;
						this.operator=chunk[i];
						continue;
					}
					// Detect the = operator
					if(CHR_EQ===chunk[i]) {
						this.state=PARSE_RVAL;
						this.operator=chunk[i];
						continue;
					}
					// Fail if a new line is found
					if(chunk[i]===CHR_ENDL||chunk[i]===CHR_CR) {
						if(this.stricMode) {
							throw Error('Unexpected new line found while parsing '
							+' a leftValue.');
						}
						this.state=PARSE_NEWLINE;
						continue;
					}
					// Store LVAL chars
					this.leftValue+=chunk[i];
					continue;
				// Read right value content
				case PARSE_RVAL:
					// Left value should not be empty
					if(''===this.leftValue) {
						if(this.stricMode) {
							throw Error('Found an empty leftValue.');
						}
						this.state=PARSE_SILENT;
					}
					// Stop if a new line is found
					if(chunk[i]===CHR_ENDL||chunk[i]===CHR_CR) {
						// rightValue can be empty only with the = operator
						if(this.operator!=CHR_EQ&&''===this.rightValue) {
							if(this.stricMode) {
								throw Error('Found an empty rightValue.');
							}
							this.state=PARSE_NEWLINE;
							continue;
						}
						// Compute rvals if it's a ref
						if(this.operator===CHR_REF) {
							this.rightValue='ref to the object';
						}
						// Compute lval
						
						// set rval in lval (with operators)
						
						// if the newline was escaped, continue to read the string
						if(this.escaped) {
							this.state=PARSE_MLSTRING;
							this.escaped=false;
						} else {
							this.state=PARSE_NEWLINE;
						}
						continue;
					}
					// Store RVAL chars
					this.rightValue+=chunk[i];
					continue;
				// Parse the content of a multiline value
				case PARSE_MLSTRING:
				// Finding the = char after an operator
				case PARSE_OPERATOR:
					if(chunk[i]===CHR_EQ) {
						this.state=PARSE_RVAL;
						continue;
					}
					if(this.stricMode) {
						throw Error('Unexpected char after the "'+this.operator+'"'+
						' operator. Expected =, found '+chunk[i]+'.');
					}
					if(chunk[i]===CHR_EQ||chunk[i]===CHR_CR) {
						this.state=PARSE_NEWLINE;
					} else {
						this.state=PARSE_SILENT;
					}
					continue;
				// Parsing a comment content
				case PARSE_COMMENT:
					if(chunk[i]===CHR_ENDL||chunk[i]===CHR_CR) {
						this.state=PARSE_NEWLINE;
					}
					continue;
				// Something was wrong, waiting for a newline to continue parsing
				case PARSE_SILENT:
					if(true!==this.escaped&&chunk[i]===CHR_ENDL||chunk[i]===CHR_CR) {
						this.state=PARSE_NEWLINE;
					}
					this.escaped=false;
					continue;
			}
		}
	};

// END: Module logic end

	return VarStreamReader;

});})(this,typeof define === 'function' && define.amd ?
	// AMD
	define :
	// NodeJS
	(typeof exports === 'object'?function (name, deps, factory) {
		var root=this;
		if(typeof name === 'object') {
			factory=deps; deps=name;
		}
		module.exports=factory.apply(this, deps.map(function(dep){
			return require(dep);
		}));
	}:
	// Global
	function (name, deps, factory) {
		var root=this;
		if(typeof name === 'object') {
			factory=deps; deps=name;
		}
		this.VarStreamReader=factory.apply(this, deps.map(function(dep){
			return root[dep.substring(dep.lastIndexOf('/')+1)];
		}));
	}.bind(this)
	)
);
