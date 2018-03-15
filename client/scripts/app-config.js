
angular.module('app').config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 
    function( $stateProvider, $urlRouterProvider, $locationProvider) {
        
        $locationProvider.html5Mode(true); // remove hash-bang.
        // <--- INITIAL ROUTES --->
        $urlRouterProvider.when('/blog', '/blog/abstracts/all/posts/1'); 
        $urlRouterProvider.when('/admin/list', '/admin/list/1'); 
        $urlRouterProvider.otherwise('/home');
        var states = []; 
        // <--- UNPROTECTED ROUTES ---> 
        //<--- BLOG STATE AND ITS CHILD STATES --->
        states.push(blogState = { // the parent state for child states: abstracts, absract, article and search states
            name: 'blog',
            url: '/blog',
            component: 'blog',
            params: {
                year: 'all',
                month: 'posts'
            },
            resolve: {       
                // resolve - open page after data loads if a promise
                pages: ['ClientApiService', '$stateParams', '$filter', '$location', 
                    function(ClientApiService, $stateParams, $filter, $location) {                                              
                        return ClientApiService.getPages().then(function(pages){
                            // set initial page values from url parameters
                            var isArticle  = $location.path().search(/article/i);
                            if(isArticle == -1){
                                pages.year = $stateParams.year;
                                pages.month = $stateParams.month;
                                pages.subTitle = $stateParams.month + ' ' + $stateParams.year;
                                var filter = pages.year + '/' + pages.month;
                                if(filter !== 'posts/all'){
                                    pages.filteredAbstracts = $filter('filterByMonth')(pages.abstracts, filter);
                                } else {
                                    pages.filteredAbstracts = pages.abstracts;
                                }
                            } else {
                                pages.year = 'posts'; //'all'; /* correct re-direction to non-path
                                pages.month = 'all'; //posts';
                                pages.subTitle = $stateParams.month + ' ' + $stateParams.year;
                                pages.filteredAbstracts = pages.abstracts;
                            }
                            
                            return pages
                    });
                }],           
            }
        });
        states.push(abstractsState = {  // all abstracts
            name: 'blog.abstracts',
            url: '/abstracts/{month}/{year}/{page}',
            component: 'abstracts',
            params: {
                active: false
            },
            resolve: {
                currentPage: ['$stateParams', function($stateParams) { // not a promise. returned immediately
                    return $stateParams.page;
                }]
            },
            
        });
        //
        //
        states.push(articleState = {  // the article state
            name: 'blog.article',  // distinguish nested state by name with dot 
            url: '/article/{id}',
            component: 'article',
            resolve: {     
                // resolve - open page after data loads         
                abstract: ['ClientApiService', '$stateParams', 
                    function(ClientApiService, $stateParams) {
                        return ClientApiService.getAbstract($stateParams.id)
                }],
                article: ['ClientApiService', '$stateParams', 
                    function(ClientApiService, $stateParams) {
                        return ClientApiService.getArticle($stateParams.id);
                }]        
            },
            
        });
        //<--- END OF BLOG STATE AND ITS CHILDREN
        // <--- HOME STATE --->
        states.push(homeState = {
            name: 'home',
            url: '/home',
            component: 'home',
            params: {},
            resolve: {}
        });   
        // <--- ABOUT STATE ---> 
        states.push(contactState = {
            name: 'about',
            url: '/about',
            component: 'about',
        });      
        // <--- CONTACT STATE ---> 
        states.push(contactState = {
            name: 'contact',
            url: '/contact',
            component: 'contact',
        });      
        //
        // <--- START PROTECTED ROUTES ---> 
        // <--- ADMIN LOGIN STATE --->
        states.push(loginState = {
            name: 'login',
            url: '/login',
            component: 'login'
        });         
        // <--- ADMIN LIST STATE --->
        //
        states.push(listState = {
            name: 'list',
            url: '/list/{page}',
            component: 'list',
            params: {
                page: null // used for carrying return page number
                },
                resolve: {                     
                // authorize goes at top so that it calls before the other resolve parameters
                authorize: ['ClientApiService', 'AuthService', '$state', 
                    function(ClientApiService, AuthService, $state) {   
                        return AuthService.checkStatus()
                }],
                abstracts: ['ClientApiService', '$state', 
                    function(ClientApiService, $state) {               
                        return ClientApiService.getAbstracts();           
                }],
                currentPage: ['$stateParams', function($stateParams){
                    return $stateParams.page;
                }],
            } 
        });
        //
        // <--- ADMIN EDIT STATE --->
        //
        states.push(editState = {
            name: 'edit',
            url: '/list/edit/{id}',
            component: 'edit',
            params: {
                page: null // used for carrying return page number
            },
            resolve: {          
                // resolve - open page after data loads
                authorize: ['AuthService', function(AuthService) {   
                  return AuthService.checkStatus()
                }],
                pageData: ['ClientApiService', '$stateParams', function(ClientApiService, $stateParams){
                  return ClientApiService.getPageData($stateParams.id);
                }]
            }
        });
        //
        // <--- ADMIN ADD STATE --->
        states.push(addState = {
            name: 'add',
            url: '/list/add',
            component: 'add',
            params: {
              page: null // used for carrying return page number
            },
            resolve: {          
              // resolve - open page after data loads
              authorize: ['AuthService', function(AuthService) {   
                  return AuthService.checkStatus()
              }],
            }       
        }); 
        // <--- END PROTECTED ROUTES --->
        //
        // Loop over the state definitions and register them
        states.forEach(function(state) {
                $stateProvider.state(state);
            });
    }
])
.run(['$transitions', '$state', '$rootScope',  
    function ($transitions, $state, $rootScope) {
        var spinnerElement = '<i class="fa fa-spinner fa-pulse fa-3x fa-fw" aria-hidden="true"></i>';
        var timer;
        //<--- Prevent state from transtioning if unauthorized -->
        $transitions.onError({}, function(transition) {
            if(transition.error().detail == 'unauthorized'){
                $state.go('login');                       
            }
        });
        //<--- Allow blog to expand/contract when article is opened by un-fixing/fixing the bottom menu 
        // when state transitions into and out of article.
        $transitions.onStart( { to: 'blog.article' }, function(trans) {
            var elem = document.getElementById("menu");
            elem.style.position = 'static';
        });
        $transitions.onStart( { from: 'blog.article' }, function(trans) {
            var elem = document.getElementById("menu");
            elem.style.position = 'absolute';
        });

        // <--- Spinner Element on to blog, remove when an abstract is shown.
        $transitions.onBefore( { to: 'blog' }, function(trans) {
            // add spinner if resolve is slow api          
            timer = setTimeout(function(){ 
                document.getElementById("spinner").innerHTML = spinnerElement;  
            }, 200);                                       
        });
        $transitions.onSuccess( { to: 'blog.abstracts' }, function(trans) {
            document.getElementById("spinner").innerHTML='';
            clearTimeout(timer);
        });
        //
        // <--- Spinner Element on to article, remove when an article is shown.
        $transitions.onBefore( { to: 'blog.article' }, function(trans) {
            // add spinner if resolve is slow api          
            timer = setTimeout(function(){ 
                document.getElementById("spinner").innerHTML = spinnerElement;  
            }, 200);
        });
        $transitions.onSuccess( { to: 'blog.article' }, function(trans) {
            document.getElementById("spinner").innerHTML='';
            clearTimeout(timer);
        });
}]);