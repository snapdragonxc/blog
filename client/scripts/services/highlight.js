angular.module('highlight-services', [] ).factory('HighlightService', 
    function () {
        function ReplaceBracketsWithANSII( mytxt ){
            mytxt = mytxt.replace(/</g, "&lt;");
            mytxt = mytxt.replace(/\&lt\;\//g, "&lt;&#47;");
            mytxt = mytxt.replace(/>/g, "&gt;");
            mytxt = mytxt.replace(/\\\//g, "&#92;&#47;") 
            return mytxt;
        }
        function RemoveRegEx( mytxt, myArray ){
            // Regular Expressions are processed per line.
            var cnt = 0;
            var lines = mytxt.split(/\r?\n/);
            var leadingSpace = "";
            for(var k = 0; k < lines.length; k++){
                // get space, including tabs, up to start of the first character and remove
                lines[k] = lines[k].replace(/(\s*)(.*)/, function(match, p1, p2, offset, string){
                    leadingSpace = p1;
                    return p2;
                });

                var data = lines[k].split(/\s/); // split line based on spaces
                //    var data = lines[k].split(/\b/); // - word break causes error in regexReplacer
                function regexReplacer(match, p1, p2, offset, string) {
                    p1 = ReplaceBracketsWithANSII(p1);
                    p2 = ReplaceBracketsWithANSII(p2);
                      var str = p1 + 'xml-javascript-regex' + cnt ;
                    if( p2 == ""){
                        str = p1 + "//";
                    } else {
                        myArray.push(p2);
                          cnt += 1;
                    } 
                      return str;
                }
                for(var j = 0; j < data.length; j++){
                    data[j] =  data[j].replace(/([^\d^\s^\/^"]*\s*)\/(.*)\//g, regexReplacer);
                }
                lines[k] = leadingSpace; 
                var len = data.length -1;
                for(var j = 0; j < len; j++){
                    lines[k] = lines[k] + data[j] + " "; // re-insert space
                }
                if(len >= 0){
                    lines[k] = lines[k] + data[len]; // drop space on end of line
                }
            }
            mytxt = "";
            var len = lines.length;
            for(var k = 0; k < len - 1; k++){
                mytxt = mytxt + lines[k] + "\n";
            }
            mytxt = mytxt + lines[len-1];
            return mytxt;
        }
        function RemoveComments( mytxt, myArray, myArrayRegEx, arrString, arrSingleString){
            var cnt = 0;        
            mytxt = mytxt.replace(/(\/\/.*)\n/g, function (match, p1, offset, string) {
                  var str = 'xml-javascript-comment' + cnt;
                  // Replace regex in comments to prevent double tags
                for(var i = myArrayRegEx.length -1; i >= 0 ; i--){            
                    var re = new RegExp("xml-javascript-regex" + i,"g");
                    p1 = p1.replace(re, myArrayRegEx[i]);
                }
                // Replace strings in comments to prevent double tags
                for(var i = arrString.length -1; i >= 0 ; i--){            
                    var re = new RegExp("xml-javascript-string" + i,"g");
                    p1 = p1.replace(re, arrString[i]);
                }
                // Replace single strings in comments to prevent double tags
                for(var i = arrSingleString.length -1; i >= 0 ; i--){            
                    var re = new RegExp("xml-javascript-single" + i,"g");
                    p1 = p1.replace(re, arrSingleString[i]);
                }
                  myArray.push("<span class='jscrpt-comment'>" + p1 + "</span>" + '\n');
                  cnt += 1;
                  return str;
            }); 
            return mytxt;
        }
        function RemoveLeftComments( mytxt, myArray, myArrayRegEx, arrString, arrSingleString){
            var cnt = 0;   
            mytxt = mytxt.replace(/(\/\*.*)\n/g, function (match, p1, offset, string) {
                console.log('p1', p1)
                  var str = 'xml-javascript-left-comment' + cnt;
                  // Replace regex in comments to prevent double tags
                for(var i = myArrayRegEx.length -1; i >= 0 ; i--){            
                    var re = new RegExp("xml-javascript-regex" + i,"g");
                    p1 = p1.replace(re, myArrayRegEx[i]);
                }
                // Replace strings in comments to prevent double tags
                for(var i = arrString.length -1; i >= 0 ; i--){            
                    var re = new RegExp("xml-javascript-string" + i,"g");
                    p1 = p1.replace(re, arrString[i]);
                }
                // Replace single strings in comments to prevent double tags
                for(var i = arrSingleString.length -1; i >= 0 ; i--){            
                    var re = new RegExp("xml-javascript-single" + i,"g");
                    p1 = p1.replace(re, arrSingleString[i]);
                } 
                myArray.push("<span class='jscrpt-comment'>" + p1 + "</span>" + '\n');
                cnt += 1;
                return str;
            }); 
            return mytxt;
        }
        function RemoveRightComments( mytxt, myArray, myArrayRegEx, arrString, arrSingleString){
            var cnt = 0;
            mytxt = mytxt.replace(/(.*\*\/)\n/g, function (match, p1, offset, string) {

                console.log('p1', p1)
                  var str = 'xml-javascript-right-comment' + cnt;
                  // Replace regex in comments to prevent double tags
                for(var i = myArrayRegEx.length -1; i >= 0 ; i--){            
                    var re = new RegExp("xml-javascript-regex" + i,"g");
                    p1 = p1.replace(re, myArrayRegEx[i]);
                }
                // Replace strings in comments to prevent double tags
                for(var i = arrString.length -1; i >= 0 ; i--){            
                    var re = new RegExp("xml-javascript-string" + i,"g");
                    p1 = p1.replace(re, arrString[i]);
                }
                // Replace single strings in comments to prevent double tags
                for(var i = arrSingleString.length -1; i >= 0 ; i--){            
                    var re = new RegExp("xml-javascript-single" + i,"g");
                    p1 = p1.replace(re, arrSingleString[i]);
                }
                myArray.push("<span class='jscrpt-comment'>" + p1 + "</span>" + '\n');
                cnt += 1;
                return str;
            }); 
            return mytxt;
        }
        function RemoveStrings( mytxt, myArray1, myArray2){
            var cnt = 0;    
            mytxt = mytxt.replace(/("[^"]*")/g, function(match, p1, offset, string) {
                  var str = 'xml-javascript-string' + cnt;
                  myArray1.push(p1);
                  cnt += 1;
                  return str;
            });
            cnt = 0;        
            mytxt = mytxt.replace(/('[^']*')/g, function (match, p1, offset, string) {
                  var str = 'xml-javascript-single' + cnt;
                  myArray2.push(p1);
                  cnt += 1;
                  return str;
            });
            return mytxt;
        }
        function RemoveNumbers( mytxt, myArray){
            var cnt = 0;
            mytxt = mytxt.replace(/([\s=\*\+-/:)/(])(\d+)/g, function (match, p1, p2, offset, string) {
                  var str = p1 + 'xml-javascript-number' + cnt;
                  myArray.push("<span class='jscrpt-number'>" + p2 + "</span>");
                  cnt += 1;
                  return str;
            } );
            return mytxt;
        }
        function HighlightScript(txt){
            var arrRegex = [], arrComments = [], arrString = [], arrSingleString = [], arrNumbers = [],arrLeftComments = [], arrRightComments = [];
            txt = RemoveRegEx(txt, arrRegex);
            txt = ReplaceBracketsWithANSII(txt);
            txt = RemoveStrings( txt, arrString, arrSingleString);        
            txt = RemoveComments(txt, arrComments, arrRegex, arrString, arrSingleString);
            txt = RemoveRightComments(txt, arrRightComments, arrRegex, arrString, arrSingleString); /* order is important - right must come first */
            txt = RemoveLeftComments(txt, arrLeftComments, arrRegex, arrString, arrSingleString);
            txt = RemoveNumbers( txt, arrNumbers);        
            // Keyword Replacer
            txt = txt.replace(/(function\s|return\s|for\s|new\s|var\s|let\s|while\s|if\s|else\s|switch\s|case\s|break\s|default\s|with\s|\sin\s)/g, '<span class="jscrpt-keyword">' + '$1' + '</span>');            
            txt = txt.replace(/(function|if|return|while|else|switch|case|break|with|\sin)\(/g, '<span class="jscrpt-keyword">' + '$1' + '</span>' + '(');           
            txt = txt.replace(/\((function\s|if\s|return\s|while\s|else\s|new\s|switch\s|case\s|break\s|with\s|in\s)/g, '(' + '<span class="jscrpt-keyword">' + '$1' + '</span>');            
            txt = txt.replace(/(break|default)(:|;)/g, '<span class="jscrpt-keyword">' + '$1' + '</span>' + '$2');           
            // Insert Comment Tags
            for(var i = arrComments.length -1; i >= 0 ; i--){            
                var re = new RegExp("xml-javascript-comment" + i,"g");
                txt = txt.replace(re, arrComments[i]);
            }
            // Insert Left-Comment Tags
            for(var i = arrLeftComments.length -1; i >= 0 ; i--){            
                var re = new RegExp("xml-javascript-left-comment" + i,"g");
                txt = txt.replace(re, arrLeftComments[i]);
            }
            // Insert Right-Comment Tags
           for(var i = arrRightComments.length -1; i >= 0 ; i--){            
                var re = new RegExp("xml-javascript-right-comment" + i,"g");
                txt = txt.replace(re, arrRightComments[i]);
            }          
            // Insert String Tags
            for(var i = arrString.length -1; i >= 0 ; i--){            
                var re = new RegExp("xml-javascript-string" + i,"g");
                txt = txt.replace(re, "<span class='jscrpt-string'>" + arrString[i]  + "</span>");
            }
            for(var i = arrSingleString.length -1; i >= 0 ; i--){            
                var re = new RegExp("xml-javascript-single" + i,"g");
                txt = txt.replace(re, "<span class='jscrpt-string'>" + arrSingleString[i] + "</span>");
            } 
            // Insert Number Tags
            for(var i = arrNumbers.length -1; i >= 0 ; i--){            
                var re = new RegExp("xml-javascript-number" + i,"g");
                txt = txt.replace(re, arrNumbers[i]);
            }
            // Insert Regex Tags
            for(var i = arrRegex.length -1; i >= 0 ; i--){            
                var re = new RegExp("xml-javascript-regex" + i,"g");
                txt = txt.replace(re, "<span class='jscrpt-regex'>" + "/" +  arrRegex[i]  +  "/" + "</span>");
            } 
            return txt;
        }
        function HighlightHTMLCode(txt){
            // Remove Scripts
            var arrScripts = [], arrAttr = [], count = 0;    

            txt = txt.trim();
                
            txt = txt.replace(/(<script[^>]*>)([\s\S]*?)<\/script>/g, function (match, p1, p2, offset, string) {
                  var str = p1 + 'xml-javascript-' + count + '<\/script>';
                  arrScripts.push(p2);
                  count += 1;
                  return str;
            });
            // Process Scripts        
            for(var i = 0; i < arrScripts.length; i++){
                arrScripts[i] = HighlightScript(arrScripts[i]);
            }
            // Remove Attributes
            count = 0;        
            txt = txt.replace( /<(\w+\s+)([^>]*)>/g, function (match, p1, p2, offset, string) {              
                  if(p2 == '')
                      return '';
                  var stng = '<' + p1 + 'xml-attribute-' + count + '>';
                  arrAttr.push(p2);
                  count += 1;
                  return stng;
            });         
            // Process attributes
            for(var i = 0; i < arrAttr.length; i++){
                arrAttr[i] = arrAttr[i].replace(/([\w-]+\s*)(=)*(\s*"[^"]*")*/g, "<span class='xml-attribute'>$1</span>$2<span class='xml-string'>$3</span>");
            } 
            // Process tags
            // Use markers as substitutes for brackets
            // aaaa = <
            // bbbb = >
            // cccc = </
            // dddd * eeee = tag
            // meta tag
            txt = txt.replace(/<(\![\w-\s]*)>/g, "mmmm$1nnnn");
            // Opening tag
            txt = txt.replace(/<(\w+)(\s+)([\w-]*)>/g, "aaaadddd$1eeee$2$3bbbb");
            txt = txt.replace(/<(\w+)>/g, "aaaadddd$1eeeebbbb");
            // Closing tag
            txt = txt.replace(/<\/(\w+)>/g, "ccccdddd$1eeeebbbb");
            // Replace markers with span elements with class defining each color
            txt = txt.replace(/mmmm(\![\w-\s]*)nnnn/g,  "<span class='xml-meta'>&lt;$1&gt;</span>");
            txt = txt.replace(/aaaa/g, "<span class='xml-bracket'><</span>");
            txt = txt.replace(/bbbb/g, "<span class='xml-bracket'>></span>");
            txt = txt.replace(/cccc/g, "<span class='xml-bracket'><&#47;</span>");
            txt = txt.replace(/dddd(\w+)eeee/g, "<span class='xml-tag'>$1</span>");
            // Replace Attributes
            for(var i = 0; i < arrAttr.length; i++){            
                var re = new RegExp("xml-attribute-" + i,"g");
                txt = txt.replace(re, arrAttr[i]);
            }
            // Replace Script
            for(var i = 0; i < arrScripts.length; i++){            
                var re = new RegExp("xml-javascript-" + i,"g");
                txt = txt.replace(re, arrScripts[i]);
            }
            // add <pre> tags to  each line
            var lines = txt.split(/\n/);
           
            var x = ""; // html
            for(var i = 0; i < lines.length; i++){
                x = x + '<pre>' + '<span>' + lines[i]  + "\n" + '</span>' + '</pre>';
            //    x = x + '<span>' + lines[i]  + "\n" + '</span>';
            }
            //x = '<pre><code>' + x + '</code></pre>';
            return x // return html code with span elements for color and pre elements for spacing
        }
        return {
            AddColor: function(txt){
                return HighlightHTMLCode(txt)
            }                  
        };
    }
);