angular.module('edit').component('edit', {
    bindings: { 
        pageData: '=',
    }, 
    templateUrl: 'components/edit/edit-template.html',
    controller: ['$state', '$stateParams', 'CalendarService', 'ClientApiService', '$window', 'MonthsToNumberService', 'HighlightService',
        function($state, $stateParams, CalendarService, ClientApiService, $window, MonthsToNumberService, HighlightService) {                
            this.cancel = function(){
                $window.history.back();        
            }    
            this.decorateAbstract = function(x) {  
                var abstract = x;
                abstract.month = '' + /[a-zA-Z]+/.exec(abstract.filter);
                abstract.year = '' + /^[0-9]+/.exec(abstract.filter); 
                return abstract;
            }
            this.saveBlog = function(){
                var sortIdx = 12 * (parseInt(this.pageData.year) - 2014 ) + MonthsToNumberService[this.pageData.month];
                var blog = {
                    title: this.pageData.title,        // The same for both article and abstract
                    fulltxt: this.pageData.fulltxt,     // The main text of the article. Can contain code
                    subtxt: this.pageData.subtxt,   //  The text shown by the abstract
                    day: this.pageData.day,    // day, month, year for category filtering of abstracts
                    month: this.pageData.month,
                    year: this.pageData.year,
                    sortIdx: sortIdx
                }
                // convert html code text to text with pre/code formatters. Do this on save
                var txt = blog.fulltxt; //  txt for colouring
                // Code is distiguished by '[code]' brackets. Add color to text only within these brackets.
                txt = txt.replace(/\[code\]([\s\S]*?)\[\/code\]/g, function(match, txt, offset, string) {  
                    return '<div class="color-code">'  +  HighlightService.AddColor(txt) + '</div>';
                });                     
                blog.fulltxt = txt;
                ClientApiService.updateBlog($stateParams.id, blog).then(function(resp){
                        // Reset form
                        this.subtxt = '';
                        this.fulltxt = '';
                        this.title = '';                
                        $state.go('list', { page: $stateParams.page }, {reload: true}); // set cache false so data reloads            
                    }, function(err){
                        $state.go('login');
                    }
                );
            }  
        }]
});