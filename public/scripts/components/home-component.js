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
