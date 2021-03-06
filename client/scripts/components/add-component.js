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