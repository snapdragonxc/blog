"use strict"
var mongoose = require('mongoose');
var articleSchema = mongoose.Schema({
	title: { type: String, unique: true},  // title must be unique.
	fulltxt: String
});
var Article = mongoose.model('Article', articleSchema);
module.exports = Article;
