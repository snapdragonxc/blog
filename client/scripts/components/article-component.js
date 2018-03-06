angular.module('article', ['ui.router']).component('article', {
    bindings: { 
        article: '<',
        abstract: '<',
    }, // one way binding with resolve
    templateUrl: '../partials/article-template.html',
    controller:[ '$window', 'MonthsFullNameService', '$timeout','HighlightService', 'HighlightJSservice',
        function($window, MonthsFullNameService, $timeout, HighlightService, HighlightJSservice){
            var that = this;
            this.goBack = function(){
                $window.history.back();                    
            }    
            this.getDate = function(x){
                var mo = '' + /[a-zA-Z]+/.exec(x);
                var yr = '' + /^[0-9]+/.exec(x);
                return MonthsFullNameService[mo] + ' ' + yr;
            }
            this.highlight = function(txt){
                // convert html code. 
                var subtxt = txt; //  txt for colouring
                // Code is distiguished by '[code]' brackets. Add color to text only within these brackets.
                subtxt = subtxt.replace(/\[code\]([\s\S]*?)\[\/code\]/g, function(match, txt, offset, string) {  
                    return '<div class="color-code">'  +  HighlightService.AddColor(txt) + '</div>';
                });                      
                //
                // convert javascript code. 
                // Code is distiguished by '[codejs]' brackets. 
                subtxt = subtxt.replace(/\[codejs\]([\s\S]*?)\[\/codejs\]/g, function(match, txt, offset, string) {  
                    return '<div class="color-code">'  +  HighlightJSservice.AddColor(txt) + '</div>';
                });                      
                return subtxt;
            }     
            angular.element( function(){ // equivalenet to document ready
                document.querySelectorAll('.article-abstract')[0].style.cssText += 'max-height: 10000px';    
            });            
        }]
});