angular.module('list').component('list', {
    bindings: { 
        abstracts: '=',  // one way binding        
        currentPage: '=',
        callback: '&' // used to set logout button on main nav menu
    }, 
    templateUrl: 'components/list/list-template.html',
    controller: ['$state', 'ClientApiService',
        function($state, ClientApiService) {
            this.currentPage = 1; 
            this.pageSize = 5; 
            var that = this;
            this.$onInit = function(){
                that.callback({value: true}); // set state of logout button on main
            }
            this.addBlog = function(){
                $state.go('add', { page: this.currentPage } );
            }
            this.deleteBlog = function(id){                
                var lastPage =  Math.ceil(this.abstracts.length /this.pageSize);
                if(lastPage == 0 ){
                    nextPage = 1;                
                } else {
                    var idx = 5;
                    if( parseInt(this.currentPage) == lastPage ){
                        idx = this.abstracts.length % 5
                    }
                    if( (idx - 1) == 0 ){
                        nextPage = parseInt(this.currentPage) - 1;
                    } else {
                        nextPage = parseInt(this.currentPage)
                    }
                }
                if(nextPage == 0 ){
                    nextPage = 1;
                }    
                ClientApiService.deleteBlog(id).then(function(resp){
                        $state.go('list', { page: nextPage }, {reload: true});
                    }, function(err){
                        $state.go('login');
                    }
                );                     
            }            
            this.nextPage = function() {
                this.currentPage = parseInt(this.currentPage) + 1                
                $state.go('list', { page: this.currentPage  });
            } 
            this.prevPage = function() {
                this.currentPage = parseInt(this.currentPage) - 1
                $state.go('list', { page: this.currentPage });
            } 
            this.stripAbstract = function(subtxt){
                var extract = subtxt.split('<p>');
                if(extract.length === 1){ // text contains no paragraphs
                    return extract[0].substring(0, 230); // limit to 230 characters
                } else { // text contains paragraphs
                    return extract[1].split('</p>')[0].substring(0, 230); // return first paragraph limit to 235 characters
                }
            }
        }]
});