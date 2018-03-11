angular.module('abstracts', ['ui.router']).component('abstracts', {
    bindings: { 
        abstracts: '<', // one way binding
        currentPage: '<', 
        query: '=', // two way binding - query is used for filtering of abstracts with search etc
          init: '<'
    }, 
    templateUrl: '../partials/abstracts-template.html',

    controller: [ '$state', '$window', '$location', 'MonthsFullNameService', '$timeout', '$stateParams',
        'HighlightService',
        function($state, $window, $location, MonthsFullNameService, $timeout, $stateParams, 
                    HighlightService){
            this.$onInit = function(){
                if($stateParams.active){
                    document.getElementById('search-box').focus();
                }
            }
            this.currentPage = 1;
            this.pageSize = 1; 
            // note resolved parameters are not available here until the view has loaded.
            this.nextPage = function() {
                this.currentPage = parseInt(this.currentPage) + 1                
                $state.go('blog.abstracts', { page: this.currentPage });
            } 
            this.prevPage = function() {
                this.currentPage = parseInt(this.currentPage) - 1                
                $state.go('blog.abstracts', { page: this.currentPage });
            }  
            this.getDate = function(x){
                var mo = '' + /[a-zA-Z]+/.exec(x);
                var yr = '' + /^[0-9]+/.exec(x);
                return MonthsFullNameService[mo] + ' ' + yr;
            }  
            this.readMore = function(abstract){
                $state.go('blog.article', {id: abstract._id});
            }   
            this.highlight = function(txt){
                if(txt == undefined)
                    return '';
                // Convert any HTML code to code with colour on the fly. 
                // HTML code is distiguished by '[code]' brackets. Add color to text only within these brackets.
                txt = txt.replace(/\[code\]([\s\S]*?)\[\/code\]/g, function(match, txt, offset, string) {  
                    return '<div class="color-code">'  +  HighlightService.AddColor(txt) + '</div>';
                });                      
                //
                // Convert any javascript code to code with colour on the fly. 
                // Javascript code is distiguished by '[codejs]' brackets. 
                txt = txt.replace(/\[codejs\]([\s\S]*?)\[\/codejs\]/g, function(match, txt, offset, string) {  
                    return '<div class="color-code">'  +  HighlightService.AddColor(txt, 'js') + '</div>';
                });                      
                return txt;
            }     
        }]
});




    