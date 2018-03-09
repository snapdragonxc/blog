angular.module('api-services', [] ).
factory('ClientApiService',  ['$http', '$q', 'CalendarService', 'AuthService', 
    function($http, $q, CalendarService, AuthService) {
    //<--- Data global across states --->
    var data = []; 
    var article;
    var adminMode = false;
    
    // var categories = [];
    function populateCategories(abstracts) {
      // a category is {filter: , number: }
        var years = ['2018', '2017', '2016', '2015'];
        //var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var months = ["Dec", "Nov", "Oct", "Sep", "Aug", "Jul", "Jun", "May", "Apr", "Mar", "Feb", "Jan"];
        var categories = [];
        categories.push({ filter: 'posts/all', number: abstracts.length});     
        years.forEach( function(year){
            var filteredByYear = abstracts.filter( function(abstract){
                var filterYear = '' +  /^[0-9]+/.exec(abstract.filter) ;
                return ( year === filterYear )
            })
            if(filteredByYear.length != 0){
                months.forEach( function(month) {
                    var filteredByMonth = filteredByYear.filter(function(abstract){
                         var filterMonth =  '' + /[a-zA-Z]+/.exec(abstract.filter);
                          return ( month === filterMonth )
                    })
                    if(filteredByMonth != 0){
                        categories.push({
                            filter: year + '/' + month,
                            number: filteredByMonth.length
                        });
                    }                  
                });
            }          
        });
        return categories;
    } 
    //<--- API SERVICE --->
    var service = {
        // Set up the page data for each state, including initial state values
        getPages: function(){  // used by Blog state          
            return service.getAbstracts().then( function (abstracts) {
                return {
                  abstracts: abstracts,
                  categories: populateCategories(abstracts),
                }
            });      
        }, 
        setAdminMode: function(mode){
            adminMode = mode;
        },
        getAdminMode: function(){
            return adminMode;
        },        
        getAbstracts: function() {  
          // use a promise 
          return $q(function(resolve, reject) {  
                var adminMode = AuthService.getAuthorized();
                if(adminMode){ // if in admin mode then do not cache data
                    $http.get('api/abstracts', { cache: false }).then(function(resp) {                       
                        data = resp.data;
                        resolve(data);
                    }, function(err){
                        reject(err)
                    });
                } else { // if not in admin mode then cache data  
                    $http.get('api/abstracts', { cache: true }).then(function(resp) {                       
                        data = resp.data;
                        resolve(data);
                    }, function(err){
                        reject(err)
                    });
                }
            })
        },
        getAbstract: function(id) {  // returns a promise
          function abstractMatchesParam(abstract) {
            return abstract._id === id;
          }         
          return service.getAbstracts().then(function (abstracts) {
            return abstracts.find(abstractMatchesParam)
          });
        },
        getArticle: function(id) {
          // use a promise so that categories can be called after data loads
          return $q(function(resolve, reject) {  
                var adminMode = AuthService.getAuthorized();
                if(adminMode){ // if admin mode do not cache data               
                    $http.get('api/article/' + id, { cache: false }).then(function(resp) {  // returns a promise
                        var article = resp.data;
                        resolve(article);
                    }, function(err){
                        reject(err)
                    });    
                } else { // if admin mode cache data  
                    $http.get('api/article/' + id, { cache: true }).then(function(resp) {  // returns a promise
                        var article = resp.data;
                        resolve(article);
                    }, function(err){
                        reject(err)
                    });                   
                }
            })
        },
        // <--- API ROUTES --->
        getPageData: function(abstractId) {         
            return service.getAbstract(abstractId).then(function (abstract) {
                return service.getArticle(abstractId).then(function(article){
                      var pageData = {
                          title: abstract.title,
                          day: abstract.day,
                          month: '' + /[a-zA-Z]+/.exec(abstract.filter),
                          year: '' + /^[0-9]+/.exec(abstract.filter),
                          subtxt: abstract.subtxt,
                          fulltxt: article.fulltxt,
                      }
                      return pageData;
                });
            });
        },
        saveBlog: function(blog) {
            return $http.post('/api/blog', blog ).then(function (resp) {
                reloadData = true;
                return resp;
            });
        },
        updateBlog: function(id, blog) {
          return $http.put('/api/blog/' + id, blog ).then(function (resp) {
              reloadData = true;  // reload abstracts after save
              return resp;
          });
        },
          deleteBlog: function(id) { // payload is article object { content: txt }
            return $http.delete('/api/blog/' + id ).then(function(resp){
              reloadData = true; // reload abstracts after save
                  return resp;
            });
          }
    }
   return service
}]);
