/*
 * Copyright (C) 2012 Nicolas Froidure
 *
 * This file is free software;
 * you can redistribute it and/or modify it under the terms of the GNU
 * General Public License (GPL) as published by the Free Software
 * Foundation, in version 3. It is distributed in the
 * hope that it will be useful, but WITHOUT ANY WARRANTY of any kind.
 *
 */

// AMD + global + NodeJS : You can use this object by inserting a script
// or using an AMD loader (like RequireJS) or using NodeJS
(function(root,define){ define([], function() {
// START: Module logic start

	// Constructor
	function VarStreamReader (scope, prop, options) {
		// Keep a ref to the root scope
		this.rootScope={root:scope,prop:prop};
		// Save the options
		this.options=options;
		// Store current scopes for backward references
		this.previousNodes=new Array();
		// The parse state
		this.state=PARSE_NEWLINE;
		// The current values
		this.leftValue='';
		this.rightValue='';
		this.operator='';
		this.escaped=ESC_NONE;
	}

	// Static consts
	VarStreamReader.STRICT_MODE=1;
	VarStreamReader.OPTIONS=VarStreamReader.STRICT_MODE;

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
		, ARRAY_NODE_CHARS = /^[0-9]+$/
		, PROP_NODE_CHARS = /^[a-zA-Z0-9]+$/
		, BCK_CHARS = /^\^[0-9]*$/
		// Parsing status
		, PARSE_NEWLINE = 1
		, PARSE_LVAL = 2
		, PARSE_OPERATOR = 3
		, PARSE_RVAL = 4
		, PARSE_MLSTRING = 5
		, PARSE_COMMENT = 6
		, PARSE_SILENT = 7
		// Escape status
		, ESC_NONE = 0
		, ESC_LF = 1
		, ESC_ALL = 3
		;

	VarStreamReader.prototype.resolveScope = function (val) {
		var nodes=val.split(CHR_SEP), scope=this.rootScope, n;
		// Looking for backward refs in the first node
		if(nodes[0]&&nodes[0][0]==CHR_BCK) {
			// if no previous nodes
			if(0===this.previousNodes.length) {
				if(this.options&VarStreamReader.STRICT_MODE) {
					throw Error('Backward reference given while no previous nodes.');
				}
				if(1===nodes.length||1===nodes[0].length) {
					return null;
				} else {
					nodes.shift();
				}
			}
			// if no numbers adding every previous nodes except the prop
			if(nodes[0]==CHR_BCK) {
				n=this.previousNodes.length-2;
			// if numbers
			} else {
				// check it
				if(!BCK_CHARS.test(nodes[0])) {
					if(this.options&VarStreamReader.STRICT_MODE) {
						throw Error('Malformed backward reference.');
					}
					return null;
				}
				var n=parseInt(nodes[0].substring(1),10);
			}
			if(n>this.previousNodes.length) {
				if(this.options&VarStreamReader.STRICT_MODE) {
					throw Error('Backward reference index is greater than the previous'
						+' node max index.');
				}
				return null;
			}
			this.previousNodes.length=n+1;
			nodes.shift();
			nodes.unshift.apply(nodes,this.previousNodes);
		}
		// Looping throught each nodes
		for(var i=0, j=nodes.length; i<j; i++) {
			// Checking if the node is not empty
			if(''===nodes[i]) {
				if(this.options&VarStreamReader.STRICT_MODE) {
					throw Error('The leftValue can\'t have empty nodes ('+val+').');
				}
				return null;
			}
			// Array operators
			if(-1!==ARRAY_OPS.indexOf(nodes[i])||ARRAY_NODE_CHARS.test(nodes[i])) {
				// Ensure the scope is an array
				if('undefined'=== typeof scope.root[scope.prop]
					||!(scope.root[scope.prop] instanceof Array)) {
						scope.root[scope.prop]=new Array();
				}
				if(nodes[i]===CHR_PLU) {
						nodes[i]=scope.root[scope.prop].length;
				}
				if(nodes[i]===CHR_MUL) {
					nodes[i]=scope.root[scope.prop].length-1;
				}
				if(nodes[i]===CHR_NEW) {
					nodes[i]=scope.root[scope.prop].length=0;
				}
			} else {
				// Checking node chars
				if(!PROP_NODE_CHARS.test(nodes[i])) {
					if(this.options&VarStreamReader.STRICT_MODE) {
						throw Error('Illegal chars found in a the node "'+nodes[i]+'".');
					}
					return null;
				}
				// Ensure the scope is an object
				if('undefined'=== typeof scope.root[scope.prop]
					||!(scope.root[scope.prop] instanceof Object)) {
						scope.root[scope.prop]=new Object();
				}
			}
			// Resolving the node scope
			scope={
				root : scope.root[scope.prop],
				prop : nodes[i]
			};
		}
		this.previousNodes=nodes.slice(0);
		return scope;
	};

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
					this.escaped=ESC_NONE;
				} else {
					this.escaped=ESC_ALL;
					continue;
				}
			}
			// parsing chars according to the current state
			switch(this.state) {
				// Continue while newlines
				case PARSE_NEWLINE:
					this.escaped=ESC_NONE;
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
					if(this.leftValue.lastIndexOf(CHR_SEP)!=this.leftValue.length-1
						&&-1!==EQ_OPS.indexOf(chunk[i])) {
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
						if(this.options&VarStreamReader.STRICT_MODE) {
							throw Error('Unexpected new line found while parsing '
							+' a leftValue.');
						}
						this.state=PARSE_NEWLINE;
						continue;
					}
					// Store LVAL chars
					this.state=PARSE_LVAL;
					this.leftValue+=chunk[i];
					continue;
				// Read right value content
				case PARSE_RVAL:
					// Left value should not be empty
					if(''===this.leftValue) {
						if(this.options&VarStreamReader.STRICT_MODE) {
							throw Error('Found an empty leftValue.');
						}
						this.state=PARSE_SILENT;
					}
					// Stop if a new line is found
					if(chunk[i]===CHR_ENDL||chunk[i]===CHR_CR) {
						// rightValue can be empty only with the = operator
						// or if the strin is multiline
						if(this.operator!=CHR_EQ&&''===this.rightValue
							&&this.escaped===ESC_NONE) {
							if(this.options&VarStreamReader.STRICT_MODE) {
								throw Error('Found an empty rightValue.');
							}
							this.state=PARSE_NEWLINE;
							continue;
						}
						// Compute rval
						// if it's a ref
						if(this.operator===CHR_REF) {
							this.rightValue=this.resolveScope(this.rightValue);
						// null
						} else if('null'===this.rightValue) {
							this.rightValue=null;
						// Booleans
						} else if('true'===this.rightValue) {
							this.rightValue=true;
						} else if('false'===this.rightValue) {
							this.rightValue=false;
						// Numbers
						} else if('NaN'===this.rightValue) {
							this.rightValue=NaN;
						} else if(/^\-?([0-9]+(\.[0-9]+)?|Infinity)$/
							.test(this.rightValue)) {
							this.rightValue=Number(this.rightValue);
						}
						// Compute lval
						this.leftValue=this.resolveScope(this.leftValue);
						// set rval in lval (with operators)
						if(null!==this.leftValue) {
							switch(this.operator) {
								case CHR_REF:
									this.leftValue.root[this.leftValue.prop]=
										this.rightValue.root[this.rightValue.prop];
								break;
								case CHR_EQ:
									if(this.rightValue!=='') {
										this.leftValue.root[this.leftValue.prop]=this.rightValue;
									} else {
										delete this.leftValue.root[this.leftValue.prop];
									}
								break;
								case CHR_PLU:
									this.leftValue.root[this.leftValue.prop]+=this.rightValue;
								break;
								case CHR_MIN:
									this.leftValue.root[this.leftValue.prop]-=this.rightValue;
								break;
								case CHR_MUL:
									this.leftValue.root[this.leftValue.prop]*=this.rightValue;
								break;
								case CHR_DIV:
									this.leftValue.root[this.leftValue.prop]/=this.rightValue;
								break;
								case CHR_MOD:
									this.leftValue.root[this.leftValue.prop]%=this.rightValue;
								break;
							}
						}
						// if the newline was escaped, continue to read the string
						if(this.escaped) {
							if(chunk[i]===CHR_CR) {
								this.escaped=ESC_LF;
							} else {
								this.escaped=ESC_NONE;
							}
							if(null!==this.leftValue) {
								this.state=PARSE_MLSTRING;
								this.leftValue.root[this.leftValue.prop]+=chunk[i];
							} else {
								this.state=PARSE_SILENT;
							}
						} else {
							this.state=PARSE_NEWLINE;
						}
						continue;
					}
					// Store RVAL chars
					if(this.escaped) {
						if(this.escaped==ESC_ALL) {
							if(this.options&VarStreamReader.STRICT_MODE) {
								throw Error('Found an escape char but there was nothing to escape.');
								}
							this.rightValue+='\\';
						}
						this.escaped=ESC_NONE;
					}
					this.rightValue+=chunk[i];
					continue;
				// Parse the content of a multiline value
				case PARSE_MLSTRING:
					if(this.escaped) {
						if(this.escaped===ESC_ALL&&chunk[i]===CHR_CR) {
							this.escaped=ESC_LF;
						} else if(chunk[i]===CHR_ENDL) {
							this.escaped=ESC_NONE;
						} else {
							if(this.escaped===ESC_LF) {
								if(this.options&VarStreamReader.STRICT_MODE) {
									throw Error('Assuming a LF after an escaped CR, '
										+chunk[i]+' found instead.');
								}
							} else {
								if(this.options&VarStreamReader.STRICT_MODE) {
									throw Error('Found an escape char but there was nothing to escape.');
								}
								this.leftValue.root[this.leftValue.prop]+='\\';
							}
							this.escaped=ESC_NONE;
						}
					} else if(chunk[i]===CHR_ENDL||chunk[i]===CHR_CR) {
						this.state=PARSE_NEWLINE;
						continue;
					}
					// Store RVAL chars
					this.leftValue.root[this.leftValue.prop]+=chunk[i];
					continue;
				// Finding the = char after an operator
				case PARSE_OPERATOR:
					if(chunk[i]===CHR_EQ) {
						this.state=PARSE_RVAL;
						continue;
					}
					if(this.options&VarStreamReader.STRICT_MODE) {
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
					if((chunk[i]===CHR_ENDL&&!(this.escaped&ESC_LF))
						||(chunk[i]===CHR_CR&&!(this.escaped&ESC_ALL))) {
						this.state=PARSE_NEWLINE;
						continue;
					}
					if(chunk[i]===CHR_CR&&(this.escaped&ESC_ALL)) {
						this.escaped=ESC_LF;
					}
					if(chunk[i]===CHR_ENDL&&(this.escaped&ESC_LF)) {
						this.escaped=ESC_NONE;
					}
					continue;
				// Something was wrong, waiting for a newline to continue parsing
				case PARSE_SILENT:
					//console.log('silent',i,chunk[i]);
					if((chunk[i]===CHR_ENDL&&!(this.escaped&ESC_LF))
						||(chunk[i]===CHR_CR&&!(this.escaped&ESC_ALL))) {
						this.state=PARSE_NEWLINE;
						continue;
					}
					if(chunk[i]===CHR_CR&&(this.escaped&ESC_ALL)) {
						this.escaped=ESC_LF;
					}
					if(chunk[i]===CHR_ENDL&&(this.escaped&ESC_LF)) {
						this.escaped=ESC_NONE;
					}
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
