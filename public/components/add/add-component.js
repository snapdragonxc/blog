angular.module('add').
	component('add', {
		bindings: { 
		}, 		
		templateUrl: 'components/add/add-template.html',
		controller: function($state, $stateParams, CalendarService, ClientApiService, $window, 
				HighlightService, MonthsToNumberService) {	
			var that = this;
			this.$onInit = function(){
			}	
			this.cancel = function(){
				 $window.history.back();		
			}	
			this.saveBlog = function(){
				//console.log('saving article');
				//console.log('title', this.title);
				//console.log('content', this.content);
				//console.log('mos', MonthsToNumberService[this.selectedMonth]);
				var sortIdx = 12 * ( parseInt(this.selectedYear) - 2014 ) + MonthsToNumberService[this.selectedMonth];
				var blog = {
					title: this.title,		// The same for both article and abstract
					fulltxt: this.fulltxt, 	// The main text of the article. Can contain code
					subtxt: this.subtxt,   //  The text shown by the abstract
					day: this.selectedDay,	// day, month, year for category filtering of abstracts
					month: this.selectedMonth,
					year: this.selectedYear,
					sortIdx: sortIdx
				}
				// convert html code text to text with pre/code formatters for color. Do this on save
				var txt = blog.fulltxt; //  txt for colouring
                 // Code is distiguished by '[code]' brackets. Add color to text only within these brackets.
                txt = txt.replace(/\[code\]([\s\S]*?)\[\/code\]/g, function(match, txt, offset, string) {  
                      return '<div class="color-code">'  +  HighlightService.AddColor(txt) + '</div>';
                });
                //console.log(txt)                        
                blog.fulltxt = txt;
				ClientApiService.saveBlog(blog).then(function(resp){
						//console.log(resp);
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
			//console.log(this.selectedYear)
			this.changeDate = function() {
		    	this.days = CalendarService.getDays(this.selectedMonth, this.selectedYear);
		    	if(this.selectedDay > this.days.length)
		    		this.selectedDay = thise.days.length.toString();
			}; 
			/* End Calendar */		
		}
});