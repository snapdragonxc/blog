angular.module('blog', ['ui.router']).component('blog', {
    bindings: { 
        pages: '<',
        query: '='
    }, 
    templateUrl: '../partials/blog-template.html',
    controller: [ '$state', '$location', '$filter', 'AuthService', 
        function($state, $location, $filter, AuthService){            
            this.decorateCategory = function(category) {  
                if(category.filter !== "posts/all") {
                    category.month = $filter('extractMonth')(category.filter); 
                    category.year = $filter('extractYear')(category.filter);  
                } else {
                    category.month = 'all';
                    category.year = 'posts'
                }
                return category;
            } 
            this.onSearch = function(){
                this.pages.subTitle = "Search Results"
                $state.go('blog.abstracts', { year: 'posts', month : 'all', page: '1' });
                this.pages.filteredAbstracts = $filter('filter')(this.pages.abstracts, this.query);
            }    
            this.onEnter = function(){
                $state.go('blog.abstracts', { year: 'posts', month : 'all', page: '1', active: true });
            }        
            this.onClick = function(category ){
                this.pages.filter = category.filter;
                this.pages.year = category.year;
                this.pages.month = category.month;
                this.pages.subTitle = category.month + ' ' + category.year;
                this.pages.filteredAbstracts = $filter('filterByMonth')(this.pages.abstracts, this.pages.filter);
                $state.go('blog.abstracts', { year: category.year, month : category.month, page: '1', active: false  }, {reload: true});
            }            
            this.isArchiveActive = function(category) {
                var arr =  $location.path().split('\/');
                var filter = arr[4] + '/' + arr[3];
                return (category.filter == filter)
            }
            this.isActive = function(index) {
                var idx =  $location.path().split('\/')[5] - 1;                
                return (idx == index)
            }
            // For open close posts
            this.postHide = false;
            this.openPosts = function(){
                if(this.postHide){
                    this.postHide = false;
                    document.querySelectorAll('.blog-recent-posts')[0].style.cssText += 'max-height: 200px';        
                } else {
                    this.postHide = true;
                    document.querySelectorAll('.blog-recent-posts')[0].style.cssText += 'max-height: 500px';                    
                }
            }
            // For open close archives
            this.archiveHide = false;
            this.openArchives = function(){
                if(this.archiveHide){
                    this.archiveHide = false;
                    document.querySelectorAll('.blog-archive-posts')[0].style.cssText += 'max-height: 200px';
                } else {
                    this.archiveHide = true;
                    document.querySelectorAll('.blog-archive-posts')[0].style.cssText += 'max-height: 500px';
                }
            }            
        }]
});