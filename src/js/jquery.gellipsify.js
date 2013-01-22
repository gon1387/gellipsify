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
(function($) {
	var GEllipsify = function(targetElement, options) {
		var _defaultOptions = {
			ellipsis : '...',
			maxChars : 0,
			maxWords : 0,
			maxLevel : 0,
			preserveText : false,
			appendStyle : 'append',
			click : null
		};
		var hasTruncation = false;

		//set prop
		this.options = $.extend({}, _defaultOptions, options);
		this.targetElement = targetElement;
		this.textNode = null;
		this.ellipsis = null;

		if (this.options.preserveText) {
			this.nodeStorage = [];
			this.operation = this.saveSiblings;
		} else {
			this.operation = this.removeSiblings;
		}

		hasTruncation = this.crawler(this.targetElement);

		if (hasTruncation) {
			this.appendEllipsis(this.options.ellipsis);
		}

		$(this.ellipsis).on({
			click : ( typeof this.options.click === 'function' && this.options.click) || (this.options.preserveText && $.proxy(this.restoreContent, this))
		});
	};

	GEllipsify.prototype = {
		constructor : GEllipsify,

		setOptions : function(option, value) {
			if ( typeof option === 'object') {
				this.options = $.extend({}, this.options, option);
			} else if ( typeof option === 'string' && typeof value !== 'undefined') {
				this.options[option] = value;
			} else {
				return;
			}
		},

		/**
		 *
		 * @param {Object} node
		 * @param {Object} level
		 * @param {Object} crawlInfo
		 */
		crawler : function(node, level, crawlInfo) {
			var crawler = arguments.callee;
			var level = level || 0;
			var crawlInfo = crawlInfo || {};
			var isDone = false;
			var saveSiblings = false;

			//add char and word count in the crawl info
			if (node.nodeType === 3) {
				crawlInfo.totalChar = (crawlInfo.totalChar || 0) + GEllipsify.util.countCharacters(node.nodeValue);
				crawlInfo.totalWord = (crawlInfo.totalWord || 0) + GEllipsify.util.countWords(node.nodeValue);
				//Check if it satisfy's the limits
				if ((crawlInfo.totalChar && this.options.maxChars && crawlInfo.totalChar > this.options.maxChars) || (crawlInfo.totalWord && this.options.maxWords && crawlInfo.totalWord > this.options.maxWords)) {
					isDone = true;
					saveSiblings = true;
				}
			} else {
				//check the parent first
				if (node.childNodes.length) {
					if (!this.options.maxLevel) {
						isDone = crawler.call(this, node.firstChild, (level + 1), crawlInfo);
					} else if (level < this.options.maxLevel) {
						isDone = crawler.call(this, node.firstChild, (level + 1), crawlInfo);
					}

					//cutoff was initiated by a child
					if (isDone && level) {
						saveSiblings = true;
					}
				}
			}

			//now check the sibling
			if (!isDone && node.nextSibling && level) {
				isDone = crawler.call(this, node.nextSibling, level, crawlInfo)
			}

			//if done store remaining siblings
			if (saveSiblings) {
				if (node.nodeType === 3) {
					this.operation(node, crawlInfo);
				} else if (node.nextSibling) {
					this.operation(node.nextSibling, crawlInfo);
				}
			}

			return isDone;
		},

		restoreContent : function() {
			var storageLength = this.nodeStorage.length;
			var counter = 0;
			var parentElement = null;

			//remove ellipsis
			this.ellipsis.parentNode.removeChild(this.ellipsis);

			for (; counter < storageLength; counter++) {
				if (this.nodeStorage[counter].prev) {
					parentElement = this.nodeStorage[counter].prev.parentNode;
				} else if (this.nodeStorage[counter].parent) {
					parentElement = this.nodeStorage[counter].parent;
				}

				parentElement.replaceChild(this.nodeStorage[counter].node.firstChild, parentElement.lastChild);
				while (this.nodeStorage[counter].node.firstChild) {
					parentElement.appendChild(this.nodeStorage[counter].node.firstChild);
				}
			}
		},

		saveSiblings : function(node, crawlInfo) {
			var nodeStorage = Object.create(GEllipsify.nodeLevelStruct);
			nodeStorage.node = document.createDocumentFragment();

			if (node.previousSibling) {
				nodeStorage.prev = node.previousSibling;
			} else {
				nodeStorage.parent = node.parentNode;
			}

			while (node.nextSibling) {
				nodeStorage.node.appendChild(node.parentNode.removeChild(node.nextSibling));
			}
			//change the node val
			if (node.nodeType === 3) {
				nodeStorage.node.insertBefore(document.createTextNode(node.nodeValue), nodeStorage.node.firstChild);
				node.nodeValue = GEllipsify.util.getRemainingString(node.nodeValue, crawlInfo, {
					chars : this.options.maxChars,
					words : this.options.maxWords
				});
				this.textNode = node;
			}
			this.addToStorage(nodeStorage);
		},

		removeSiblings : function(node, crawlInfo) {
			while (node.nextSibling) {
				node.parentNode.removeChild(node.nextSibling);
			}
			//change the node val
			if (node.nodeType === 3) {
				node.nodeValue = GEllipsify.util.getRemainingString(node.nodeValue, crawlInfo, {
					chars : this.options.maxChars,
					words : this.options.maxWords
				});
				this.textNode = node;
			}
		},

		addToStorage : function(dump) {
			this.nodeStorage.push(dump);
		},
		appendEllipsis : function(ellipsis) {
			var style = this.options.appendStyle;
			var container = document.createElement('span');
			var ellipsisCharLength = 0;
			var textNodeLen = this.textNode.nodeValue.length;

			if ( typeof ellipsis === 'string') {
				container.innerHTML = ellipsis;
			} else if (ellipsis.jquery) {
				container.innerHTML = ellipsis.html();
			} else if (ellipsis.nodeType && ellipsis.nodeType === 1) {
				container.appendChild(ellipsis);
			}

			ellipsisCharLength = container.textContent.length;
			switch(style) {
				case 'omit':
					if (textNodeLen - 3 >= ellipsisCharLength) {
						this.textNode.nodeValue = this.textNode.nodeValue.substr(0, textNodeLen - ellipsisCharLength);
						this.ellipsis = this.textNode.parentNode.appendChild(container);
					} else {
						this.ellipsis = this.textNode.parentNode.appendChild(container);
					}

					break;
				case 'append':
				default:
					this.ellipsis = this.textNode.parentNode.appendChild(container);
					break;
			};

		}
	}

	GEllipsify.nodeLevelStruct = {
		prev : null,
		next : null,
		parent : null,
		node : null
	};

	GEllipsify.util = {};
	GEllipsify.util.getRemainingString = function(textString, crawlInfo, limit) {
		var stringCharLen = GEllipsify.util.countCharacters(textString);
		var stringWordLen = GEllipsify.util.countWords(textString);
		var aggregatedWordLen = crawlInfo.totalWord;
		var aggregatedCharLen = crawlInfo.totalChar;
		var wordsLimit = limit.words;
		var charsLimit = limit.chars;
		var remainingWordString = textString;
		var remainingCharString = textString;

		//had the string reaches the word limit?
		//if not, retain the string
		if (wordsLimit && aggregatedWordLen > wordsLimit && (wordsLimit - (aggregatedWordLen - stringWordLen)) >= 0) {
			remainingWordString = GEllipsify.util.getRemainingWords(textString, wordsLimit - (aggregatedWordLen - stringWordLen));
		}
		//had the string reaches the char limit?
		//if not retian the string
		if (charsLimit && aggregatedCharLen > charsLimit && (charsLimit - (aggregatedCharLen - stringCharLen)) >= 0) {
			remainingCharString = GEllipsify.util.getRemainingCharacters(textString, charsLimit - (aggregatedCharLen - stringCharLen));
		}

		//check which one's a lot lesser in length'
		if (remainingWordString.length <= remainingCharString.length) {
			return remainingWordString;
		} else {
			return remainingCharString;
		}
	};
	GEllipsify.util.getRemainingCharacters = function(textString, charCount) {
		return textString.substring(0, charCount);
	};
	GEllipsify.util.getRemainingWords = function(textString, wordCount) {
		var WSList = textString.match(/[^\w]+/g);
		var wordList = textString.match(/\w+/g);
		var returnString = '';
		var counter = 0;
		//place the whitespace in front, if found at the start of string
		if (textString.indexOf(WSList[0]) === 0) {
			returnString += WSList.splice(0, 1);
		}

		for (; counter < wordCount - 1; counter++) {
			returnString += (wordList[counter] + (WSList[counter] || ''));
		}
		returnString += wordList[counter];

		return returnString;
	};
	GEllipsify.util.countCharacters = function(stringValue) {
		return stringValue.length;
	};
	//TODO: check for unicode problem
	GEllipsify.util.countWords = function(stringValue) {
		var tempString = stringValue.match(/\w+/g);
		return (tempString && tempString.length) || 0;
	};

	$.fn.gellipsify = function(userOptions) {
		return this.each(function() {
			var $this = $(this), data = $this.data('gellipsify');

			if (!data) {
				$this.data('gellipsify', ( data = new GEllipsify(this, userOptions)))
			}
		});
	};
})(jQuery);
