/************************************************************************
=========================================================================
   jquery-gellipsify.js - v0.1.0
   https://github.com/gon1387/gellipsify
=========================================================================
  Copyright 2013 Carlo Gonzales

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
************************************************************************/
(function ($) {
	var GEllipsify = function(targetNode,options){
		var _defaultOptions = {
			ellipsis: "...",
			maxCharacters: null,
			maxWords: null,
			childMinLevel: 0,
			childMaxLevel: 1,
			debug: false
		};
		// clear any textNode inconcistencies
		targetNode.normalize();
		//set Object properties
		this.options = $.extend({},_defaultOptions,options);
		this.targetElement = targetNode;
		this.nodeStructure = Object.create(GEllipsify.nodeStruct);
		this.nodeStats = {};
		this.elementStorage = document.createDocumentFragment();
		
		//checch the structure for strategy implementation
		GEllipsify.util.analyzeStructure(this.targetElement, 0, this.options.childMaxLevel, 0, this.nodeStructure, this.nodeStats);
		console.log(this.nodeStats);
		
		try{
			//identify and run strategy
			this.ellipsifierStrategy = this.identifyStrategy();
			this.executeStrategy();
		} catch(e){
			if(this.options.debug){
				console.log(e.message);
				GEllipsify.util.printStructure(this.nodeStructure, 0);
			}
		}
	};
	
	GEllipsify.prototype = {
		constructor: GEllipsify,
		
		identifyStrategy: function(){
			var ellipsifierStrategy,
				targetElement = this.targetElement,
				uniqueNodeTypes = Object.getOwnPropertyNames(this.nodeStats);
			
			//identify what strategy to use
			if(uniqueNodeTypes.length == 2){
				if(this.nodeStats[targetElement.nodeName].count === 1){
					ellipsifierStrategy = GEllipsify.type.textNodeOnlyStrategy;
				}
			} else if(uniqueNodeTypes.length > 2){
				
			}
			
			if(!ellipsifierStrategy){
				throw Error("No strategy for this scenario exist");
			}
			
			return ellipsifierStrategy;
		},

		executeStrategy: function(){
			this.ellipsifierStrategy.execute.call(this);
		},
		
		storeOmittedNodes: function(node){
			this.elementStorage.appendChild(node);
		}
		
	};
	
	GEllipsify.nodeStruct = {
		nodeRef: null,
		charCount: 0,
		wordCount: 0,
		children: null,
		prev: null,
		next: null
	};
	
	GEllipsify.util = {};
	GEllipsify.util.analyzeStructure = function(targetNode, currentLevel, maxLevel, targetSiblingCount, structRef, uniqueNodeStats){
		// TODO: Recheck the possibility this function will have a memory leak.
		var analyzeStructure = arguments.callee,
			nodeInfo = structRef[targetSiblingCount] = Object.create(GEllipsify.nodeStruct),
			nodeStats = uniqueNodeStats;
			
		nodeInfo.nodeRef = targetNode;
			
		if(currentLevel){
			var nodeType = targetNode.nodeType;
			
			//textNodes: get word or char count
			if(nodeType == 3){
				nodeInfo.charCount = GEllipsify.util.countCharacters(targetNode.nodeValue);
				nodeInfo.wordCount = GEllipsify.util.countWords(targetNode.nodeValue);
			//if it was an element, check if allowed to get up to another dom level
			//  then add the children
			} else if(nodeType == 1){
				if(currentLevel < maxLevel && targetNode.childNodes.length){
					nodeInfo.children = {};
					analyzeStructure.call(this, targetNode.firstChild, (currentLevel + 1), maxLevel, 0, nodeInfo.children, uniqueNodeStats);
				}
			}
			
			//if there's no previous sibling, it means, it was created first
			nodeInfo.prev = structRef[targetSiblingCount-1] || null;
			
			//prepare the next sibling, if there's none reference next to null
			if(targetNode.nextSibling !== null){
				analyzeStructure.call(this, targetNode.nextSibling, currentLevel, maxLevel, (targetSiblingCount + 1), structRef, uniqueNodeStats);
				structRef[targetSiblingCount].next = structRef[targetSiblingCount+1];
			} else {
				structRef[targetSiblingCount].next = null;
			}
		
		// Make sure to createa an object for the 0 level
		} else {			
			//add the children
			nodeInfo.children = {};
			analyzeStructure.call(this, targetNode.firstChild, (currentLevel + 1), maxLevel, 0, nodeInfo.children, uniqueNodeStats);
		}
		
		//CREATE STATS
		nodeStats[targetNode.nodeName] 				= nodeStats[targetNode.nodeName] || {};
		nodeStats[targetNode.nodeName].count 		= (nodeStats[targetNode.nodeName].count || 0) + 1;
		nodeStats[targetNode.nodeName].charCount 	= (nodeStats[targetNode.nodeName].charCount || 0) + nodeInfo.charCount;
		nodeStats[targetNode.nodeName].wordCount 	= (nodeStats[targetNode.nodeName].wordCount || 0) + nodeInfo.wordCount;
		
		//Make sure there's no memory leak, pray there's none ;)
		nodeInfo 	= null;
		nodeStats 	= null;
	};
	
	GEllipsify.util.printStructure = function(nodeStruct, currentDept){
		var printStructure = arguments.callee,
			prefixString = " ",
			i = 0;
		
		//START PRINTING
		while(i<currentDept){
			prefixString += "| ";
			i++;
		}
		if(currentDept > 0 && nodeStruct.prev ===  null){
			console.log(prefixString + "\\");
			console.log(prefixString + "|-" + nodeStruct.nodeRef.nodeName);
		} else if(currentDept > 0 && nodeStruct.prev !==  null){
			console.log(prefixString + "|-" + nodeStruct.nodeRef.nodeName);
		} else {
			console.log(nodeStruct[0].nodeRef.nodeName);
		}
		//END PRINTING
		
		// check if the node got children
		if(nodeStruct.children !== null){
			printStructure(nodeStruct.children[0], (currentDept + 1));
		//if non, then, it's the top parent
		} else if(currentDept===0){
			printStructure(nodeStruct[0].children[0], (currentDept + 1));
		}
		
		if(nodeStruct.next){
			printStructure(nodeStruct.next, currentDept);
		}
	};
	
	GEllipsify.util.countCharacters = function(stringValue){
		return stringValue.length;
	};
	GEllipsify.util.countWords= function(stringValue){
		return stringValue.match(/\w+/g).length;
	};
	
	//Strategies
	//Additional strategy for node element mix
	GEllipsify.type={};
	GEllipsify.type.textNodeOnlyStrategy = {
		execute: function(){
			var targetElement = this.targetElement;
		}
	};
	
	$.fn.gellipsify = function(userOptions){
		return this.each(function(){
			var options = typeof userOptions == 'object' && userOptions,
				$this = $(this),
				data = $this.data("gellipsify");
			if(!data){
				$this.data("gellipsify",(data = new GEllipsify(this, userOptions)))
			}
		});
	};
})(jQuery);
