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