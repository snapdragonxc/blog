"use strict"
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
// Define User Model
var userSchema = mongoose.Schema({
  username: { type:String, index:{unique:true} },
  password: String
});
// Add password validation function to User model as required by passport
userSchema.methods.validPassword = function(myPlaintextPassword){
	var result = bcrypt.compareSync(myPlaintextPassword, this.password);
	//console.log('passwd compare', result);
	return result;
}
var User = mongoose.model('User', userSchema);
// // call AddUser once on installation to add encrypted user to mongodb
function AddUser(){ 
	var salt, hash, password;
	var saltRounds = 10;
	var userName = "xxxxxx";
	var myPlaintextPassword = "xxxxxx";
	bcrypt.genSalt(saltRounds, function(err, salt) {
	    bcrypt.hash(myPlaintextPassword, salt, function(err, hash) {
	        // Store hash in your password DB.
	        var user = new User({
	        	username: userName.toLowerCase(),
	        	password: hash
	        });
	        user.save(function(err){
	        	if( !err ){
	        		console.log('User successfully created.')
	        	} else {
	        		console.log(err);
	        	}	        	
	        })
	    });
	});
}
// AddUser(); //disconnect after first call
module.exports = User;