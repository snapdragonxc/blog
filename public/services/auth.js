angular.module('auth-service', [] )
    .factory('AuthService', function ($q, $http) {
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
                currentUser.authorized = true;                                  
            },
            isAuthorized: function() {
                // use a promise 
                return $q(function(resolve, reject) {  
                    if(currentUser.authorized){ // reload data only after an administration operation
                        resolve('authorized');
                    } else {
                        status().then(function(res){ // handle page refresh
                                //console.log(res);
                                currentUser.authorized = true;  
                                resolve('authorized');
                            }, function(err){
                                //console.log(err);
                                reject('unauthorized');
                            });                    
                    }
                });
            },
            login: function(user) {
               // console.log('cred', user);
                return  $http.post('/api/login', user)
            },
            logout: function() {
                    // use a promise 
                currentUser.authorized = false;
                return $http.get('/api/logout');               
            },           
        };
        return service;
});