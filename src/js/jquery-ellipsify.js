/************************************************************************
=========================================================================
   jquery-gellipsify.js
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
			debug: false
		};
		
		this.options = $.extend({},_defaultOptions,options);
		
		//set Object properties
		this.targetNode = targetNode;console.log(targetNode);
		
		try{
			//identify and run strategy
			this.ellipsifierStrategy = this.identifyStrategy(this.targetNode,this.options);
			this.executeStrategy();
		} catch(e){
			if(this.options.debug){
				console.log(e.message);
				this.debugStructure();
			}
		}
	
	};
	
	GEllipsify.prototype = {
		constructor: GEllipsify,
		
		identifyStrategy: function(){
			var targetNode = this.targetNode,
				ellipsifierStrategy;
			
			if( targetNode.childElementCount == 0 ){
				ellipsifierStrategy = GEllipsify.type.textNodeOnlyStrategy;
			}
			
			if(!ellipsifierStrategy){
				throw Error("No strategy for this scenario exist");
			}
			
			return ellipsifierStrategy;
		},

		executeStrategy: function(){
			this.ellipsifierStrategy.execute(this.targetNode,this.options);
		},
		
		debugStructure: function(){
			var printTree,
				defaultMaxLevel=3;
				
			//print Node Tree for debuging
			// TODO: Benchmark this function, improve also
			printTree = function(node,currentLevel,maxLevel){
				if(currentLevel==0){
					console.log("*" + node.nodeName + "(parent)");
					printTree.call(this,node.childNodes[0],currentLevel+1,maxLevel);
				}
				if(currentLevel<maxLevel && !!node && currentLevel){
					var offsetString = "",c = currentLevel;
					
					if(currentLevel!=0){
						while( c > 0){
							offsetString+="| ";
							c--;
						}
					}
					if(node.parentNode.firstChild==node){
						console.log(offsetString+"\\");
					}
					if(this.targetNode!=node){
						console.log(offsetString+node.nodeName);
						
					} else {
						console.log(offsetString+node.nodeName+" <--(TargetNode)");
						printTree.call(this,node.childNodes[0],currentLevel+1,maxLevel);
					}
					
					printTree.call(this,node.nextSibling,currentLevel,maxLevel);
				}
				return;
			};
			printTree.call(this,this.targetNode.parentNode,0,defaultMaxLevel);
		}
		
	};
	
	//Strategies
	//Additional strategy for node element mix
	GEllipsify.type={};
	GEllipsify.type.textNodeOnlyStrategy = {
		execute: function(node,options){
			var stringLength,
				ellipsisLength = options.ellipsis.length,
				textNode;
				
			if( node.childNodes.length > 1 ){
				node.normalize();
			}
			
			textNode = node.childNodes[0];
			stringLength = textNode.data.length;
			
			if( options.maxCharacters < (stringLength - ellipsisLength) ){
				textNode.nodeValue = textNode.nodeValue.substr(0,options.maxCharacters) + options.ellipsis;
			}
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
