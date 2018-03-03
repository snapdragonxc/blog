angular.module('login', ['ui.router']).component('login', {
    bindings: { 
    }, // one way binding
    templateUrl: '../partials/login-template.html',
    controller: ['AuthService', '$state',
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