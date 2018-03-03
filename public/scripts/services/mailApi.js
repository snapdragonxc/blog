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
