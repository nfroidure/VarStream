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
 
	function VarStreamWriter(callback,mergeArrays,morphContexts,debug) {
		this.lastContext='';
		this.callback=callback; // Output stream callback
		this.mergeArrays=(mergeArrays?mergeArrays:true);
		this.morphContexts=(morphContexts?morphContexts:true);
		this.debug=(debug?debug:false);
		this.imbricatedArrayEntries=new Array();
	}

	VarStreamWriter.prototype.write = function (scope,context) {
		if(!context)
			context='';
		if(scope instanceof Array) {
			for(var i=0, j=scope.length; i<j; i++) {
				if(this.debug)
					console.log('Reading array entry '+i+' in scope '+context);
				this.imbricatedArrayEntries.push(true);
				this.write(scope[i],(context?context+'.':'')+(this.mergeArrays?'?':1));
				this.imbricatedArrayEntries.pop();
			}
		} else if(scope instanceof Object) {
			for (prop in scope) {
				if(this.debug) {
					console.log('Reading object property '+prop+' in scope '+context);
				}
				if (scope.hasOwnProperty(prop)&&(!(scope instanceof Function))&&/^([a-z0-9_]+)$/i.test(prop)) {
					this.write(scope[prop],(context?context+'.':'')+prop);
				}
			}
		} else {
			if(this.debug) {
				console.log('Writing value '+context);
			}
			// Changing context with imbricated arrays
			for(var i=this.imbricatedArrayEntries.length-1; i>=0; i--) {
				var index=context.lastIndexOf('?');
				if(this.imbricatedArrayEntries[i]) {
					context=context.substr(0,index)+'+'+context.substr(index+1);
					this.imbricatedArrayEntries[i]=false;
				} else {
					context=context.substr(0,index)+'*'+context.substr(index+1);
				}
			}
			// Trying to reduce context with "
			var morphedContext=context;
			if(this.morphContexts&&this.lastContext&&morphedContext.indexOf(this.lastContext+'.')===0) {
				morphedContext=morphedContext.replace(this.lastContext,'"')
			}
			// Saving this context for later use
			var index=context.lastIndexOf('.');
			this.lastContext=(index!==false?context.substr(0,index):'');
			// Calling back
			this.callback(morphedContext+'='+(scope+'').replace(/(\r?\n)/igm,'\\'+"\n")+"\n");
		}
	};

// END: Module logic end

	return VarStreamWriter;

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
		this.VarStreamWriter=factory.apply(this, deps.map(function(dep){
			return root[dep.substring(dep.lastIndexOf('/')+1)];
		}));
	}.bind(this)
	)
);

