var countCharacters = function(stringValue){
	return stringValue.length;
},
countWords= function(stringValue){
	var tempString = stringValue.match(/\w+/g);
	return (tempString && tempString.length) || 0;
};

describe("GEllipsify",function(){
	var $PlayGround,
		$body = $(document.body),
		gellipsifyjQuery,
		fillerText = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc augue risus, ultricies et tempus in, commodo quis quam. Integer ac nulla nibh. Etiam consequat erat eget neque tincidunt placerat. Vestibulum et felis elit. Vestibulum blandit varius ligula vitae rutrum. Vestibulum ac lorem sapien, quis lobortis lectus. Nam elit eros, facilisis a mollis at, dapibus vitae neque. Quisque dapibus malesuada aliquet. Sed ullamcorper leo sed leo dignissim varius. Nulla facilisi. Aliquam erat volutpat. Nunc nisl lorem, elementum dignissim posuere at, convallis ac erat.",
		fillerLength = fillerText.length,
		defaultEllipsis = "...",
		charCount = 0,
		wordCount = 0,
		ellipsisCharCount = 0,
		ellipsisWordCount = 0,
		maxChar = 0,
		maxWord = 0;
	
	/**
	 * Sets up a playground for testing 
	 */
	beforeEach(function(){
		$PlayGround = $("<div></div>");
		$PlayGround.attr("id","testing-ground");
		$body.append($PlayGround);
		
		gellipsifyjQuery = jQuery.fn.gellipsify;
		
	});
	afterEach(function(){
		$PlayGround.remove();
		
		gellipsifyjQuery = null;
	});
	
	it("Should be attached in jQuery.fn", function(){
		expect(gellipsifyjQuery).toBeDefined();
		expect(typeof gellipsifyjQuery).toBe("function");
	});
	
	describe("run as a plugin", function(){
		it("should have a GEllipsify object attached on the element through jQuery data",function(){
			$PlayGround.gellipsify();
			
			var gellipsifyObject=$PlayGround.data("gellipsify");
			
			expect(gellipsifyObject).toBeDefined();
			expect(typeof gellipsifyObject).toBe("object");
		});
		
		describe("on an element with texts only.",function(){
			beforeEach(function(){
				$PlayGround.append(fillerText);
			});
			
			describe("Having no options",function(){
				beforeEach(function(){
					$PlayGround.gellipsify();
				});
				it("should do nothing",function(){
					expect($PlayGround.text().length).toBe(fillerLength);
				});
			});
			
			describe("Having an option of",function(){
				
				describe("30 max characters",function(){
					beforeEach(function(){
						maxChar = 30;
						$PlayGround.gellipsify({
							maxChars: maxChar
						});
						charCount = countCharacters($PlayGround.text());
						ellipsisCharCount = countCharacters(defaultEllipsis);
					});
					it("should show exactly 33 characters including the ellipsis",function(){
						expect(charCount).toBe(maxChar + ellipsisCharCount);
					});
					it("should show the appended '...' ellipsis",function(){
						expect($PlayGround.text().substr(-(ellipsisCharCount))).toBe(defaultEllipsis);
					});
				});
				
				describe("30 max words",function(){
					beforeEach(function(){
						maxWord = 30;
						$PlayGround.gellipsify({
							maxWords: maxWord
						});
						wordCount = countWords($PlayGround.text());
						ellipsisWordCount = countWords(defaultEllipsis);
						ellipsisCharCount = countCharacters(defaultEllipsis);
					});
					it("should show exactly 30 words including the ellipsis",function(){
						expect(wordCount).toBe(maxWord + ellipsisWordCount);
					});
					it("should show the appended '...' ellipsis",function(){
						expect($PlayGround.text().substr(-(ellipsisCharCount))).toBe(defaultEllipsis);
					});
				});
				
				describe("both 40 max words and 60 characters",function(){
					beforeEach(function(){
						maxWord = 40;
						maxChar = 60;
						$PlayGround.gellipsify({
							maxWords: maxWord,
							maxChars: maxChar
						});
						wordCount = countWords($PlayGround.text());
						charCount = countCharacters($PlayGround.text());
						ellipsisWordCount = countWords(defaultEllipsis);
						ellipsisCharCount = countCharacters(defaultEllipsis);
					});
					it("should show exactly 9 words and 63 characters including the appended ellipsis",function(){
						//char is major, so it's chosen
						expect(charCount).toBe(maxChar+ellipsisCharCount);
					});
					it("should show the appended '...' ellipsis",function(){
						expect($PlayGround.text().substr(-(ellipsisCharCount))).toBe(defaultEllipsis);
					});
				});
				
				describe("both 15 max words and 150 characters",function(){
					beforeEach(function(){
						maxWord = 15;
						maxChar = 150;
						$PlayGround.gellipsify({
							maxWords: 15,
							maxChars: 150
						});
						wordCount = countWords($PlayGround.text());
						charCount = countCharacters($PlayGround.text());
						ellipsisWordCount = countWords(defaultEllipsis);
						ellipsisCharCount = countCharacters(defaultEllipsis);
					});
					it("should show exactly 15 words and 150 characters including the appended ellipsis",function(){
						//word is major so it's chosen
						expect(wordCount).toBe(maxWord+ellipsisWordCount);
					});
					it("should show the appended '...' ellipsis",function(){
						expect($PlayGround.text().substr(-(defaultEllipsis.length))).toBe(defaultEllipsis);
					});
				});
				
				describe("append type of 'omit'",function(){
					describe("30 max characters",function(){
						beforeEach(function(){
							maxChar = 30;
							$PlayGround.gellipsify({
								maxChars: maxChar,
								appendStyle: 'omit'
							});
							charCount = countCharacters($PlayGround.text());
							ellipsisCharCount = countCharacters(defaultEllipsis);
						});
						it("should show exactly 33 characters including the ellipsis",function(){
							expect(charCount).toBe(maxChar);
						});
						it("should show the appended '...' ellipsis",function(){
							expect($PlayGround.text().substr(-(ellipsisCharCount))).toBe(defaultEllipsis);
						});
					});
					
					describe("30 max words",function(){
						beforeEach(function(){
							maxWord = 30;
							$PlayGround.gellipsify({
								maxWords: maxWord,
								appendStyle: 'omit'
							});
							ellipsisWordCount = countWords(defaultEllipsis);
							ellipsisCharCount = countCharacters(defaultEllipsis);
							charCount = countCharacters($PlayGround.text());
							wordCount = countWords($PlayGround.text().substr(0,charCount - ellipsisCharCount));
						});
						it("should show exactly 30 words including the ellipsis",function(){
							expect(wordCount).toBe(maxWord);
						});
						it("should show the appended '...' ellipsis",function(){
							expect($PlayGround.text().substr(-(ellipsisCharCount))).toBe(defaultEllipsis);
						});
					});
					
					describe("both 40 max words and 60 characters",function(){
						beforeEach(function(){
							maxWord = 40;
							maxChar = 60;
							$PlayGround.gellipsify({
								maxWords: maxWord,
								maxChars: maxChar,
								appendStyle: 'omit'
							});
							charCount = countCharacters($PlayGround.text());
							ellipsisWordCount = countWords(defaultEllipsis);
							ellipsisCharCount = countCharacters(defaultEllipsis);
						});
						it("should show exactly 9 words and 63 characters including the appended ellipsis",function(){
							//char is major, so it's chosen
							expect(charCount).toBe(maxChar);
						});
						it("should show the appended '...' ellipsis",function(){
							expect($PlayGround.text().substr(-(ellipsisCharCount))).toBe(defaultEllipsis);
						});
					});
					
					describe("both 15 max words and 150 characters",function(){
						beforeEach(function(){
							maxWord = 15;
							maxChar = 150;
							$PlayGround.gellipsify({
								maxWords: 15,
								maxChars: 150,
								appendStyle: 'omit'
							});
							ellipsisWordCount = countWords(defaultEllipsis);
							ellipsisCharCount = countCharacters(defaultEllipsis);
							charCount = countCharacters($PlayGround.text());
							wordCount = countWords($PlayGround.text().substr(0,charCount - ellipsisCharCount));
						});
						it("should show exactly 15 words and 150 characters including the appended ellipsis",function(){
							//word is major so it's chosen
							//TODO: improve this one
							expect(wordCount <= (wordCount + 1 + ellipsisWordCount) && wordCount >= (wordCount - 1 - ellipsisWordCount)).toBeTruthy();
						});
						it("should show the appended '...' ellipsis",function(){
							expect($PlayGround.text().substr(-(defaultEllipsis.length))).toBe(defaultEllipsis);
						});
					});
					
				});
				
			});
		});
	});
});
