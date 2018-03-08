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