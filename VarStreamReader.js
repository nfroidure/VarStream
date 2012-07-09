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
var VarStreamReader=function(scope,debug)
	{
	this.rootScope=scope; // The main scope
	this.currentScopes=new Array(); // Current scopes depth
	this.currentVar=new Array(); // Current readed var
	this.multilineValue=false; // Marker to know if the next chunk begins by a multine value
	this.debug=(debug?debug:false);
	};
VarStreamReader.prototype.read = function (chunk)
	{
	var currentLeftNode, parentLeftNode, currentRightVar, currentRightNode, parentRightNode, currentValue, line=0, i=0, x=chunk.length;
	// Parsing chunk content
	if(this.debug)
		{
		console.log('# Parsing a new chunk (length:'+chunk.length+').'+"\n");
		var log='';
		}
	if(this.multilineValue)
		{
		if(this.debug)
			console.log('Line '+line+' - Finishing to fill multiline value'+"\n");
		currentValue='';
		for(i,x; i<x; i++)
			{
			if(chunk[i]=='\\'&&(chunk[i+1]=="\n"||chunk[i+1]=="\r"||i==x-1))
				{
				if(this.debug)
					log+='- Value continues on the next line'+"\n";
				currentValue+="\n";
				i=i+1;
				if(i==x-1)
					{
					if(this.debug)
						log+='- Value continues on the next line but the chunk ends'+"\n";
					this.multilineValue=true;
					}
				}
			else if(chunk[i]!="\n"&&chunk[i]!="\r")
				currentValue+=chunk[i];
			else
				break;
			}
		if(this.debug)
			log+='- Merging : '+currentValue+'.'+"\n";
		this.currentVar[this.multilineValue]+=currentValue;
		if(i<x-1)
			this.multilineValue=false;
		if(this.debug)
			console.log(log);
		}
	for(i,x; i<x; i++)
		{
		// Checking for comment or empty/malformed line
		if(chunk[i]=='#'||chunk[i]=="&"||chunk[i]=="=")
			{
			if(this.debug)
				{
				console.log('Line '+line+' - Found a comment/malformed line (char:'+chunk[i]+').'+"\n");
				log='';
				}
			while(i<x&&chunk[i]!="\n"&&chunk[i]!="\r")
				{
				if(this.debug)
					log+=chunk[i];
				i++;
				}
			if(this.debug)
				console.log('- Comment : '+log+'.'+"\n");
			line++;
			}
		else if(chunk[i]=="\n"||chunk[i]=="\r")
			{
			if(this.debug)
				console.log('Line '+line+' - Found an empty line.'+"\n");
			line++;
			continue;
			}
		// Beginning new line scan
		if(this.debug)
			{
			console.log('Line '+line+' - Scanning a new line'+"\n"+'-> Left side'+"\n");
			var log='';
			}
		this.currentVar=this.rootScope;
		currentLeftNode='';
		parentLeftNode='';
		// Scanning left side
		if(chunk[i]=='"')
			{
			if(this.debug)
				log+='- New scope back reference';
			if(chunk[i+1]=='.')
				{
				if(this.debug)
					log+=' (immediat)';
				if(this.currentScopes.length)
					this.currentVar=this.currentScopes[this.currentScopes.length-1];
				else	if(this.debug)
					log+=' (unavailable)';
				i=i+2;
				}
			else if(chunk[i+1]=='-')
				{
				if(this.debug)
					log+=' (-'+parseInt(chunk[i+2])+')';
				if(this.currentScopes.length==parseInt(chunk[i+2]))
					{
					for(var j=parseInt(chunk[i+2]); j>0; j--)
						{
						this.currentVar=this.currentScopes.pop();
						}
					i=i+4;
					this.currentScopes.push(this.currentVar);
					}
				else	if(this.debug)
					log+=' (unavailable)';
				}
			if(this.debug)
				log+="\n";
			}
		else
			this.currentScopes=new Array();
		for(i; i<x; i++)
			{
			if(chunk[i]!='.'&&chunk[i]!='='&&chunk[i]!='&'&&chunk[i]!="\n"&&chunk[i]!="\r")
				currentLeftNode+=chunk[i];
			else
				{
				if(this.debug)
					log+='- New node: '+currentLeftNode+"\n";
				if(currentLeftNode==='')
					{
					// Malformed node name
					if(this.debug)
						log+='- Bad node name'+"\n";
					break;
					}
				else if(currentLeftNode=='!')
					{
					if(this.currentVar instanceof Array)
						this.currentVar.length=0;
					//else if(this.currentVar instanceof Object)
					//	for (prop in this.currentVar) { if (this.currentVar.hasOwnProperty(prop)) { delete this.currentVar[prop]; } }
					currentLeftNode=0;
					if(this.debug)
						log+='- Resetting the array and creating a new entry, change node name from * to '+currentLeftNode+'.'+"\n";
					}
				else if(currentLeftNode=='+')
					{
					currentLeftNode=(this.currentVar instanceof Array?this.currentVar.length:0);
					if(this.debug)
						log+='- Creating a new array entry, change node name from + to '+currentLeftNode+'.'+"\n";
					}
				else if(currentLeftNode=='*')
					{
					currentLeftNode=(this.currentVar instanceof Array?this.currentVar.length-1:0);
					if(this.debug)
						log+='- Working on the last array element, change node name from * to '+currentLeftNode+'.'+"\n";
					}
				if(chunk[i]=='='||chunk[i]=='&'||chunk[i]=="\n"||chunk[i]=="\r")
					break;
				if(/^([0-9]+)$/.test(''+currentLeftNode)&&!(this.currentVar instanceof Array))
					{
					if(parentLeftNode)
						{
						this.currentVar=this.currentScopes[this.currentScopes.length-2][parentLeftNode]=new Array();
						if(this.debug)
							log+='- Parent node was not an array.'+"\n";
							}
						else if(this.debug)
								log+='- Parent node was not an array but is the root scope.'+"\n";
					}
				if(!(this.currentVar[currentLeftNode] instanceof Object))
					this.currentVar[currentLeftNode]=new Object();
				this.currentVar=this.currentVar[currentLeftNode];
				this.currentScopes.push(this.currentVar);
				if(this.debug)
					log+='- Final node name is '+currentLeftNode+'.'+"\n";
				parentLeftNode=currentLeftNode;
				currentLeftNode='';
				}
			}
		if(this.debug)
			{
			console.log(log+"\n");
			console.log('-> Right side'+"\n");
			log='';
			}
		if(currentLeftNode!=='')
			{
			// Scanning right side
			this.currentRightScopes=new Array();
			if(i<x&&chunk[i]=='&'&&chunk[i+1]=='=')
				{
				// Getting linked var
				currentRightVar=this.rootScope;
				currentRightNode='';
				parentRightNode='';
				if(this.debug)
					log+='- Right side is a linked var'+"\n";
				for(i=i+2; i<x; i++)
					{
					if(i<x-1&&chunk[i]!='.'&&chunk[i]!='='&&chunk[i]!='&'&&chunk[i]!="\n"&&chunk[i]!="\r")
						currentRightNode+=chunk[i];
					else
						{
						if(i==x-1&&chunk[i]!='.'&&chunk[i]!='='&&chunk[i]!='&'&&chunk[i]!="\n"&&chunk[i]!="\r")
							{
							currentRightNode+=chunk[i];
							i++;
							}
						if(this.debug)
							log+='- New node: '+currentRightNode+'.'+"\n";
						if(currentRightNode==='')
							{
							// Malformed node name
							if(this.debug)
								log+='- Bad node name'+"\n";
							break;
							}
						else if(currentRightNode=='!')
							{
							if(currentRightVar instanceof Array)
								currentRightVar.length=0;
							//else if(this.currentVar instanceof Object)
							//	for (prop in currentRightVar) { if (currentRightVar.hasOwnProperty(prop)) { delete currentRightVar[prop]; } }
							currentRightNode=0;
							if(this.debug)
								log+='- Resetting the array and creating a new entry, change node name from * to '+currentRightNode+'.'+"\n";
							}
						else if(currentRightNode=='+')
							{
							currentRightNode=(currentRightVar instanceof Array?currentRightVar.length:0);
							if(this.debug)
								log+='- Creating a new array entry, change node name from + to '+currentRightNode+'.'+"\n";
							}
						else if(currentRightNode=='*')
							{
							currentRightNode=(currentRightVar instanceof Array?currentRightVar.length-1:0);
							if(this.debug)
								log+='- Working on the last array element, change node name from * to '+currentRightNode+'.'+"\n";
							}
						if(i==x||chunk[i]=='='||chunk[i]=='&'||chunk[i]=="\n"||chunk[i]=="\r")
							{
							if(this.debug)
								log+='- No more node.'+"\n";
							break;
							}
						if(/^([0-9]+)$/.test(''+currentRightNode)&&!(currentRightVar instanceof Array))
							{
							if(parentRightNode)
								{
								currentRightVar=this.currentRightScopes[this.currentRightScopes.length-2][parentRightNode]=new Array();
								if(this.debug)
									log+='- Parent node was not an array.'+"\n";
								}
							else if(this.debug)
									log+='- Parent node was not an array but is the root scope.'+"\n";
							}
						if(!(currentRightVar[currentRightNode] instanceof Object))
							{
							if(this.debug)
								log+='- Nothing set for the current node, creating an array'+"\n";
							currentRightVar[currentRightNode]=new Object();
							}
						currentRightVar=currentRightVar[currentRightNode];
						this.currentRightScopes.push(currentRightVar);
						currentRightNode='';
						}
					}
				if(currentRightNode)
					{
					if(this.debug)
						log+='- Last node names : '+currentLeftNode+' (left) '+currentRightNode+' (right).'+"\n";
					this.currentVar[currentLeftNode]=currentRightVar[currentRightNode];
					}
				}
			else if(i<x&&chunk[i]=='=')
				{
				// Getting var value
				if(this.debug)
					log+='- Valued var'+"\n";
				currentValue='';
				for(i=i+1; i<x; i++)
					{
					if(chunk[i]=='\\'&&(chunk[i+1]=="\n"||chunk[i+1]=="\r"||i==x-1))
						{
						if(this.debug)
							log+='- Value continues on the next line.'+"\n";
						currentValue+="\n";
						i=i+1;
						if(i>=x-1)
							{
							if(this.debug)
								log+='- Value continues on the next line but the chunk ends.'+"\n";
							this.multilineValue=currentLeftNode;
							}
						}
					else if(chunk[i]!="\n"&&chunk[i]!="\r")
						currentValue+=chunk[i];
					else
						break;
					}
				if(this.debug)
					log+='- Var value: '+currentValue+'.'+"\n";
				if(currentValue==='false'||currentValue==='null')
					{
					this.currentVar[currentLeftNode]=false;
					}
				else if(currentValue==='true')
					{
					this.currentVar[currentLeftNode]=true;
					}
				else
					{
					this.currentVar[currentLeftNode]=currentValue;
					}
				}
			}
		else if(this.debug)
			{
			log+='- Right side is empty'+"\n";
			}
		if(this.debug)
			console.log(log+"\n");
		line ++;
		}
	};

if(!(typeof(module)=='undefined'))
	module.exports = VarStreamReader;