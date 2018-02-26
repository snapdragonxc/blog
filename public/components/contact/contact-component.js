angular.module('contact').
component('contact', {
	bindings: { 
	}, // one way binding
	templateUrl: 'components/contact/contact-template.html',
	controller: function(MailApiService, AuthService) {
		var blue = '#2196F3', green = '#4CAF50', red = '#f44336';
		var alertBox = document.querySelector('.contact-alert');
		var alertLabel = document.querySelector('.contact-alert-msg');
		this.sendMail = function(){
			alertBox.style.backgroundColor = blue; 
			alertLabel.innerHTML = "Sending Message. Please Wait";
			alertBox.style.display = "block";
			var payload = {
				from: this.from,
				subject: this.subject,
				msg: this.msg
			}
			this.from = '';
			this.subject = '';
			this.msg = '';	
			//console.log(payload);
			MailApiService.sendMail(payload).then(function(resp){
					//console.log(resp);
					alertBox.style.backgroundColor = green;
					alertLabel.innerHTML = "Message sent successfully.";					
				}, function(err){
					alertBox.style.backgroundColor = red;
					alertLabel.innerHTML = "Message failed to send.";
					//console.log(err);
				}
			) 
		}		
	}
});