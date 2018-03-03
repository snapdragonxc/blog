angular.module('abstracts', ['ui.router']).component('abstracts', {
    bindings: { 
        abstracts: '<', // one way binding
        currentPage: '<', 
        query: '=', // two way binding - query is used for filtering of abstracts with search etc
          init: '<'
    }, 
    templateUrl: '../partials/abstracts-template.html',
    controller: [ '$state', '$window', '$location', 'MonthsFullNameService', '$timeout', '$stateParams', 
        function($state, $window, $location, MonthsFullNameService, $timeout, $stateParams){
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
              this.callback = function(){
              Ellipsis({           
              ellipsis: '…',           
              debounce: 0,           
              responsive: true,           
              class: '.clamp',           
              lines: 12,           
              portrait: null,           
              break_word: true
            });
            }
            this.readMore = function(abstract){
                $state.go('blog.article', {id: abstract._id});
            }        
            /*    angular.element(function(){   A delay in rendering when using
                Ellipsis({           
                         ellipsis: '…',           
                         debounce: 0,           
                         responsive: true,           
                         class: '.clamp',           
                         lines: 12,           
                         portrait: null,           
                         break_word: true
                       });
              }); */            
        }]
});




    