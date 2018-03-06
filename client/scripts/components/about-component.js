angular.module('about', ['ui.router']).component('about', {
    bindings: { 
    }, 
    templateUrl: '../partials/about-template.html',
    controller: function(){


            this.test = function(){
                console.log('about');

                return 'c'
            }   
    }

}); 

                                                                          