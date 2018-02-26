"use strict"
var mongoose = require('mongoose');
var abstractSchema = mongoose.Schema({
	title: String,
	filter: String,  // contains month and year
	day: String,	
	sortIdx: Number, // index for sorting abstracts into chronological order. It is defined as the number of months since 2014.
	subtxt: String,
	articleId: mongoose.Schema.Types.ObjectId
});
var Abstract = mongoose.model('Abstract', abstractSchema);
module.exports = Abstract;
