/*
 * Copyright (C) 2012 Nicolas Froidure
 *
 * This file is free software;
 * you can redistribute it and/or modify it under the terms of the GNU
 * General Public License (GPL) as published by the Free Software
 * Foundation, in version 2. It is distributed in the
 * hope that it will be useful, but WITHOUT ANY WARRANTY of any kind.
 *
 */

var VarStreamWriter=function(callback,mergeArrays,debug)
	{
	this.currentNodes=new Array(); // Current nodes
	this.callback=callback; // Output stream callback
	this.mergeArrays=(mergeArrays?mergeArrays:false);
	this.debug=(debug?debug:false);
	};
VarStreamWriter.prototype.write = function (scope,context)
	{
	if(!context)
		context='';
	if(scope instanceof Array)
		{
		for(var i=0, j=scope.length; i<j; i++)
			{
			if(this.debug)
				console.log('Reading array entry '+i+' in scope '+context);
			this.write(scope[i],(context?context+'.':'')+(i==0&&!this.mergeArrays?i:'+'));
			}
		}
	else if(scope instanceof Object)
		{
		for (prop in scope)
			{
			if(this.debug)
				console.log('Reading object property '+prop+' in scope '+context);
			if (scope.hasOwnProperty(prop)&&(!(scope instanceof Function))&&/^([a-z0-9_]+)$/i.test(prop))
				{
				this.write(scope[prop],(context?context+'.':'')+prop);
				}
			}
		}
	else
		{
		if(this.debug)
			console.log('Writing value '+context);
		this.callback(context+'='+scope+"\n");
		}
	};