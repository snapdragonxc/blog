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
                console.log(sortIdx);
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