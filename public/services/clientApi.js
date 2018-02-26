angular.module('api-services', [] ).
factory('ClientApiService',  ['$http', '$q', 'CalendarService', function($http, $q, CalendarService) {
    //<--- Data global across states --->
    var data = []; 
    var article;
    var reloadData = true;
    var reloadArticle = true;
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
                       //  console.log(filterMonth);
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
        getAbstracts: function() {  
          // use a promise 
          return $q(function(resolve, reject) {  
               if(reloadData){ // reload data only after an adminitration operation
                    $http.get('api/abstracts', { cache: false }).then(function(resp) {                       
                        //console.log('reload');
                        //console.log(resp.data);
                        reloadData = false;
                        data = resp.data;
                        resolve(data);
                    }, function(err){
                        reject(err)
                    });
                } else {
                    resolve(data);
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
               if(reloadArticle){ // reload data only after an adminitration operation
                    $http.get('api/article/' + id, { cache: false }).then(function(resp) {  // returns a promise
                        var article = resp.data;
                        resolve(article);
                    }, function(err){
                        reject(err)
                    });
                } else {
                    resolve(article);
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
                          months: CalendarService.getMonths(),
                          years: CalendarService.getYears(),
                      }
                      pageData.days = CalendarService.getDays(pageData.month, pageData.year);
                      return pageData;
                });
            });
        },
        saveBlog: function(blog) {
        	return $http.post('/api/blog', blog ).then(function (resp) {
            	//console.log(resp.data);
              reloadData = true;
              reloadArticle = true;
            	return resp;
        	});
        },
        updateBlog: function(id, blog) {
          return $http.put('/api/blog/' + id, blog ).then(function (resp) {
              //console.log(resp.data);
              reloadData = true;  // reload abstracts after save
              reloadArticle = true; // reload articles after save
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
