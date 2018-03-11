angular.module('article', ['ui.router']).component('article', {
    bindings: { 
        article: '<',
        abstract: '<',
    }, // one way binding with resolve
    templateUrl: '../partials/article-template.html',
    controller:[ '$window', 'MonthsFullNameService', function($window, MonthsFullNameService){
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
            if(txt == undefined)
                return '';
            // Convert any HTML code to code with colour on the fly. 
            // HTML code is distiguished by '[code]' brackets. Add color to text only within these brackets.
            txt = txt.replace(/\[code\]([\s\S]*?)\[\/code\]/g, function(match, txt, offset, string) { 
                var html = Prism.highlight(txt, Prism.languages.html);    
                return '<div class="color-code"><pre>'  +  html + '</pre></div>';
            });                      
            //
            // Convert any javascript code to code with colour on the fly. 
            // Javascript code is distiguished by '[codejs]' brackets. 
            txt = txt.replace(/\[codejs\]([\s\S]*?)\[\/codejs\]/g, function(match, txt, offset, string) {  
                var html = Prism.highlight(txt, Prism.languages.javascript);    
                return '<div class="color-code"><pre>'  +  html + '</pre></div>';
            });                      
            return txt;
        }     
        angular.element( function(){ // equivalenet to document ready
            document.querySelectorAll('.article-abstract')[0].style.cssText += 'max-height: 10000px';    
        });            
    }]
});