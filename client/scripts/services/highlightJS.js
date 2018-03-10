angular.module('highlightJS-services', [] ).factory('HighlightJSservice', 
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
                leadingSpace = ""
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
            var mytxt = "";
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
            mytxt = mytxt.replace(/([\s=\*\+-/)/(])(\d+)/g, function (match, p1, p2, offset, string) {
                  var str = p1 + 'xml-javascript-number' + cnt;
                  myArray.push("<span class='jscrpt-number'>" + p2 + "</span>");
                  cnt += 1;
                  return str;
            } );
            return mytxt;
        }
        function HighlightScript(txt){
            var arrRegex = [], arrComments = [], arrString = [], arrSingleString = [], arrNumbers = [];
            txt = RemoveRegEx(txt, arrRegex);
            txt = ReplaceBracketsWithANSII(txt);
            txt = RemoveStrings( txt, arrString, arrSingleString);        
            txt = RemoveComments(txt, arrComments, arrRegex, arrString, arrSingleString);
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
        function HighlightJSCode(txt){

            txt = txt + '\n'; // to ensure correct termination of a comment

            var myScript = HighlightScript(txt);

            myScript = myScript.trim();

            // add <pre> tags to  each line
            var lines = myScript.split(/\n/);
            var x = ""; // html
            for(var i = 0; i < lines.length; i++){
                x = x + '<pre>' + '<span>' + lines[i]  + "\n" + '</span>' + '</pre>';
            }
            //x = '<pre><code>' + x + '</code></pre>';
            return x // return html code with span elements for color and pre elements for spacing
        }
        return {
            AddColor: function(txt){
                return HighlightJSCode(txt)
            }                  
        };
    }
);