angular.module('contact', ['ui.router']).component('contact', {
    bindings: { 
    }, // one way binding
    templateUrl: '../partials/contact-template.html',
    controller: ['MailApiService', 'AuthService',
        function(MailApiService, AuthService) {
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
                MailApiService.sendMail(payload).then(function(resp){
                        alertBox.style.backgroundColor = green;
                        alertLabel.innerHTML = "Message sent successfully.";                    
                    }, function(err){
                        alertBox.style.backgroundColor = red;
                        alertLabel.innerHTML = "Message failed to send.";
                    }
                ) 
            }        
        }]
});