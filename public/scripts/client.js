
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
angular.module('about', ['ui.router']).component('about', {
    bindings: { 
    }, 
    templateUrl: '../partials/about-template.html',
    controller: function(){
    }
}); 

                                                                          
angular.module('abstracts', ['ui.router']).component('abstracts', {
    bindings: { 
        abstracts: '<', // one way binding
        currentPage: '<', 
        query: '=', // two way binding - query is used for filtering of abstracts with search etc
          init: '<'
    }, 
    templateUrl: '../partials/abstracts-template.html',

    controller: [ '$state', 'MonthsFullNameService', '$stateParams',
        function($state, MonthsFullNameService, $stateParams){
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
        }]
});




    
angular.module('add', ['ui.router']).component('add', {
    bindings: { 
    },         
    templateUrl: '../partials/add-template.html',
    controller: [ '$state', '$stateParams', 'CalendarService', 'ClientApiService', '$window', 'MonthsToNumberService', 
        function($state, $stateParams, CalendarService, ClientApiService, $window, MonthsToNumberService){    
            var that = this;
            this.cancel = function(){
                 $window.history.back();        
            }    
            this.saveBlog = function(){
                 var sortIdx = (parseInt(this.selectedYear) - 2014) * 360 + MonthsToNumberService[this.selectedMonth] * 30
                    + parseInt(this.selectedDay);
                var blog = {
                    title: this.title,        // The same for both article and abstract
                    fulltxt: this.fulltxt,     // The main text of the article. Can contain code
                    subtxt: this.subtxt,   //  The text shown by the abstract
                    day: this.selectedDay,    // day, month, year for category filtering of abstracts
                    month: this.selectedMonth,
                    year: this.selectedYear,
                    sortIdx: sortIdx
                }
                ClientApiService.saveBlog(blog).then(function(resp){
                        // Reset form
                        this.subtxt = '';
                        this.fulltxt = '';
                        this.title = '';                
                        $state.go('list', { page: $stateParams.page });                         
                    }, function(err){
                        //console.log(err);
                        $state.go('login');
                    }
                )
            }
            /* Start Calendar */
            this.months = CalendarService.getMonths();
            this.years = CalendarService.getYears();
            this.selectedMonth = CalendarService.getCurrentMonth();
            this.selectedDay = CalendarService.getCurrentDay();
            this.selectedYear = CalendarService.getCurrentYear();
            this.days = CalendarService.getDays(this.selectedMonth, this.selectedYear);
            this.changeDate = function() {
                this.days = CalendarService.getDays(this.selectedMonth, this.selectedYear);
                if(this.selectedDay > this.days.length)
                    this.selectedDay = this.days.length.toString();
            }; 
            /* End Calendar */        
        }]
});
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

               /* this.pages.filteredAbstracts = $filter('filter')(this.pages.abstracts, {title: this.query});*/
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
                    document.querySelectorAll('.blog-recent-posts')[0].style.cssText += 'max-height: 1000px';                    
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
                    document.querySelectorAll('.blog-archive-posts')[0].style.cssText += 'max-height: 1000px';
                }
            }            
        }]
});
angular.module('contact', ['ui.router']).component('contact', {
    bindings: { 
    }, // one way binding
    templateUrl: '../partials/contact-template.html',
    controller: ['MailApiService', 'AuthService',
        function(MailApiService, AuthService) {
            var blue = '#2196F3', green = '#4CAF50', red = '#f44336';
            var alertBox = document.querySelector('.contact-alert');
            var alertLabel = document.querySelector('.contact-alert-msg');
            this.sendMail = function(){
                alertBox.style.backgroundColor = blue; 
                alertLabel.innerHTML = "Sending Message. Please Wait";
                alertBox.style.display = "block";
                var payload = {
                    from: this.from,
                    subject: this.subject,
                    msg: this.msg
                }
                this.from = '';
                this.subject = '';
                this.msg = '';    
                MailApiService.sendMail(payload).then(function(resp){
                        alertBox.style.backgroundColor = green;
                        alertLabel.innerHTML = "Message sent successfully.";                    
                    }, function(err){
                        alertBox.style.backgroundColor = red;
                        alertLabel.innerHTML = "Message failed to send.";
                    }
                ) 
            }        
        }]
});
angular.module('edit', ['ui.router']).component('edit', {
    bindings: { 
        pageData: '=',
    }, 
    templateUrl: '../partials/edit-template.html',
    controller: ['$state', '$stateParams', 'CalendarService', 'ClientApiService', '$window', 'MonthsToNumberService',
        function($state, $stateParams, CalendarService, ClientApiService, $window, MonthsToNumberService) {                
            var that = this;
            this.$onInit = function(){               
                this.selectedYear = this.pageData.year;
                this.selectedMonth = this.pageData.month;
                this.selectedDay = this.pageData.day;
                this.title = this.pageData.title;
                this.subtxt = this.pageData.subtxt;
                this.fulltxt = this.pageData.fulltxt;
                this.days = CalendarService.getDays(this.selectedMonth, this.selectedYear);
                this.months = CalendarService.getMonths();
                this.years = CalendarService.getYears();
            }
            this.cancel = function(){
                $window.history.back();        
            }    
            this.saveBlog = function(){
                var sortIdx = (parseInt(this.selectedYear) - 2014) * 360 + MonthsToNumberService[this.selectedMonth] * 30
                    + parseInt(this.selectedDay);
                //console.log(sortIdx);
                var blog = {
                    title: this.title,        // The same for both article and abstract
                    fulltxt: this.fulltxt,     // The main text of the article. Can contain code
                    subtxt: this.subtxt,   //  The text shown by the abstract
                    day: this.selectedDay,    // day, month, year for category filtering of abstracts
                    month: this.selectedMonth,
                    year: this.selectedYear,
                    sortIdx: sortIdx
                }
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
            this.changeDate = function() {
                this.days = CalendarService.getDays(this.selectedMonth, this.selectedYear);
                if(this.selectedDay > this.days.length)
                    this.selectedDay = this.days.length.toString();
            };       
        }]
});
angular.module('home', ['ui.router']).component('home', {
    bindings: { 
    }, 
    templateUrl: '../partials/home-template.html',
    controller:['$stateParams',
        function($stateParams) {
            this.$onInit = function(){
                var grid = document.querySelector('.grid');
                var msnry = new Masonry( grid, {
                    itemSelector: '.grid-item',
                    columnWidth: '.grid-item', //237, //231,                        
                    gutter: 10,
                });
                imagesLoaded( grid ).on( 'progress', function() {
                    // layout Masonry after each image loads
                    msnry.layout();
               });
            }
        }]
});

angular.module('list', ['ui.router']).component('list', {
    bindings: { 
        abstracts: '=',  // one way binding        
        currentPage: '=',
        callback: '&' // used to set logout button on main nav menu
    }, 
    templateUrl: '../partials/list-template.html',
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
angular.module('login', ['ui.router']).component('login', {
    bindings: { 
    }, // one way binding
    templateUrl: '../partials/login-template.html',
    controller: ['AuthService', '$state', 'ClientApiService',
        function(AuthService, $state) {
            var that = this;
            this.init = function(){
                this.user = {
                    username: '',
                    password: ''
                }
            }
            this.login = function() {                
                AuthService.login(this.user).then(function(res, err){                    
                        AuthService.setAuthorized(true); 
                        $state.go('list', { page: '1' }); 
                    }, function(err){
                        // console.log('error', err)
                        alert('incorrect username or password')
                        that.init();
                    }); 
            }
            this.init();            
        }]
}); 
angular.module('site-ctrl', []).
    controller('SiteCtrl', ['$state', 'AuthService', '$location', 
        function($state, AuthService, $location) {
            this.activeItem="home";
            this.hide = false;
            this.currentBtn = 'home';   
            var that = this; 
            this.showLogOut = function(value){
                this.hide = value;
            }
            this.logOut = function(){
                AuthService.logout().then(function(resp){}, function(err){
                    $state.go('home');
                    that.showLogOut(false);
                    location.reload(true);
                });
            }
            this.isActive = function(loc) {
                return loc == $location.path().split('\/')[1];
            }
            this.home = function(){
                $state.go('home');
            }
            this.checkStatus = function(){
                AuthService.checkStatus().then(function(res) {
                    that.showLogOut(true);
                }, function(err) {
                    that.showLogOut(false);
                });
            }
            this.checkStatus(); // call before DOM loads
        }]
);
angular.module('custom-filters', [])
.filter('startFrom', function() { 
    return function(input, start) {
        start = +start; 
        return input.slice(start);
    }
})
.filter('roundup', function () {
    return function (value) {
        if(value == 0){
            value = 1;
        }       
        return Math.ceil(value);
    };
})
.filter('extractMonth', function() {
    return function(x) { 
        return '' + /[a-zA-Z]+/.exec(x);
    };
})
.filter('extractYear', function() {
    return function(x) {
        return '' + /^[0-9]+/.exec(x);
    };
})
.filter('filterByMonth', function() {
    return function(x, filter) {
        if(filter == 'posts/all'){
            return x;
        } else {
            return x.filter(function(abstract) { 
                    return abstract.filter === filter;
                });
        }
    }
});


angular.module('auth-service', [] ).factory('AuthService', [ '$q', '$http', 
    function($q, $http) {
        var currentUser = {
            username: '',
            authorized: false
        }
        var status = function(){
            return $http.get('/api/status');
        };
        var service = {
            userName: currentUser.username,
            setAuthorized:  function(authorized){           
                currentUser.authorized = authorized;                                  
            },
            getAuthorized:  function(){           
                return currentUser.authorized;                                  
            },
            checkStatus: function() {
                // use a promise 
                return $q(function(resolve, reject) {  
                    if(currentUser.authorized){ 
                        resolve(true);
                    } else {
                        // handle page refresh
                        status().then(function(res){ 
                                currentUser.authorized = true;  
                                resolve(true);
                            }, function(err){
                                reject(false);
                            });                    
                    }
                });
            },
            login: function(user) {
                return  $http.post('/api/login', user)
            },
            logout: function() {
                    // use a promise 
                currentUser.authorized = false;
                return $http.get('/api/logout');               
            },           
        };
        return service;
    }]
);
angular.module('calendar-service', [] ).factory('CalendarService', 
    function () {    
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var daysOfMonth = { 
            "Jan": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
            "Mar": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
            "Apr": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
            "May": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
            "Jun": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
            "Jul": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
            "Aug": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
            "Sep": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
            "Oct": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
            "Nov": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
            "Dec": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
        };
        var daysOfFebruary = function(year){     
            if ((year % 100 != 0) && (year % 4 == 0) || (year % 400 == 0)) {
                return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 29];
            } else {
                return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
            }
        }
        /****************************/
        var d = new Date();
        return {
            getCurrentDay: function(){
                return d.getDate().toString();
            },
            getCurrentMonth: function(){               
                var m = d.getMonth();
                return months[m];
            },
            getCurrentYear: function(){
                return d.getFullYear().toString();
            },
            getYears: function(){
                return [2019, 2018, 2017, 2016, 2015, 2014];
            },
            getDays: function(month, year){
                if( month != "Feb" ){
                    return daysOfMonth[month];
                }
                else {
                    return daysOfFebruary(year);
                }
            },
            getMonths: function(){
                return months;
            }        
        };
    }
);
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

angular.module('mail-api-service', []).factory('MailApiService', ['$http', 
    function($http) {
        //<--- API MAIL SERVICE --->
        var service = {
            sendMail: function(payload) {
                return $http.post('/api/contact', payload );
            }       
        }
       return service;
    }]
);

angular.module('months-name-services', []).factory('MonthsFullNameService', 
    function (){
        return { "Jan": "January", "Feb": "February", "Mar": "March", "Apr": "April", "May": "May", "Jun": "June", "Jul": 
            "July", "Aug": "August", "Sep": "September", "Oct": "October", "Nov": "November", "Dec": "December" };
    }
)
angular.module('months-number-services', []).factory( 'MonthsToNumberService', 
    function (){
        return { "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6, "Jul": 7, "Aug": 8, 
                "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12 };
    }
)