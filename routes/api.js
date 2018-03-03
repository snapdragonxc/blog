// <--- API CATEGORY ---> //
var express = require('express');
var router = express.Router();
var passport = require('passport');
var mongoose = require('mongoose');
var Article = require('../models/article.js');
var Abstract = require('../models/abstract.js');
var nodemailer = require("nodemailer");
var config = require('../config.js');
//
// <--- PASSPORT SESSION MANAGEMENT LOGIN/LOGOUT ---> //
function sessionCheck(req, res, next){
    if(req.isAuthenticated()){  // isAuthenticated is added by passport
        return next();
    } else {
        console.log('unauthorized');
        res.send(401, 'unauthorized');
    }
}
router.post('/login',    
    passport.authenticate('local'),
    function(req, res) {
        //console.log(req);
        console.log('passport username', req.user.username);        
        res.send(req.user.username);
    }
);
router.get('/logout', function(req, res){
    req.logout(); // passport added logout to req.
    res.send(401, 'User logged out');
});
// <--- CHECK LOGIN STATUS --->
router.get('/status', sessionCheck, function(req, res) { // check login status
    res.send('logged in');
});
// <--- MAIL CONTACT INFO TO ME ---> 
router.post('/contact', function (req, res) {
    var data = req.body;
  /*  var transporter = nodemailer.createTransport({ // Old method
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'snapdragonxc@gmail.com',
            pass: 'XXXXXXX'
        }
    }); */
       var transporter = nodemailer.createTransport({ // use 0Auth2 
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            type: 'OAuth2',
            user: 'snapdragonxc@gmail.com',
            clientId: config.mail.clientId,
            clientSecret: config.mail.clientSecret,
            refreshToken: config.mail.refreshToken,
            accessToken: config.mail.accessToken,
            expires: 1484314697598
        }
    }); 
    transporter.sendMail({  //email options
            from: "Sender Name",
            to: "snapdragonxc@gmail.com", // receiver
            subject: "Blog Msg: " + data.subject, // subject
            html: data.msg + ' from: ' + data.from,
        }, function(error, response){  //callback
             if(error) {
               console.log(error);
               return res.send(500, err);
            }else{
               console.log("Message sent: " + response.message);
               res.json(req.body);
               }
        transporter.close(); 
    }); 
});

// <--- BLOG API --->
//
// A blog consists of an article and an abstract. The article has code and the full text. The abstract, has only a short piece of text 
// describing the blog and no code. The abstract contains the id of the article so that it can be updated and deleted,
//
// <--- CREATE A BLOG --->
// Order is important. The article must be created first because its id is linked in the abstract.
router.post('/blog', sessionCheck, function(req, res) { // blog consists of an article and an abstract and a category for filtering
    var blog = {
        title: req.body.title,        // for both article and abstract
        fulltxt: req.body.fulltxt, // for article
        subtxt: req.body.subtxt,   // for abstract
        day: req.body.day,            // alternatively store as date
        month: req.body.month,
        year: req.body.year,
        sortIdx: req.body.sortIdx
    }            
    var newArticle = new Article({
        title: blog.title,
        fulltxt: blog.fulltxt,
    });
    var filter = '' + blog.year + '/' + blog.month; //.toUpperCase();
    var newTitle = req.body.title;                
    Article.findOne( { title: newTitle } , function(err, existingItem){ // function called after findOne completes
        if(existingItem){            
            console.log('An article with that title already exists');
            return res.send(500, err);    
        } else {   // save the new article
            newArticle.save( function(err, article){ //  // the newArticle is returned from save if no error                
                if (err) {
                    console.log(err);
                    return res.send(500, err);
                }
                // if no error update or create a new category                
                // if article successfully created, then create a new abstract
                var newAbstract = new Abstract({
                    title: blog.title,
                    filter: filter,
                    day: blog.day,
                    sortIdx: blog.sortIdx,
                    subtxt: blog.subtxt,
                    articleId: article._id
                });
                newAbstract.save( function(err, abstract){ //  // the new article is returned from save if no error    
                    if (err) {
                        console.log(err);
                        return res.send(500, err);
                    }        
                    res.json(abstract);
                });                
            });
        }
    }); 
});
// <--- UPDATE A BLOG --->
// Update requires both the article and the abstract to be updated. 
// The id in the url is the id of the abstract.
    router.put('/blog/:_id', sessionCheck, function(req, res){
        var blog = {
            title: req.body.title,        // for both article and abstract
            fulltxt: req.body.fulltxt, // for article
            subtxt: req.body.subtxt,   // for abstract
            day: req.body.day,            // alternatively store as date
            month: req.body.month,
            year: req.body.year,
            sortIdx: req.body.sortIdx
        }
        // update the abstract first, then in the callback update the article
        var abstractId = req.params._id;
        console.log('id', abstractId);
        var filter = '' + blog.year + '/' + blog.month; 
        var abstractUpdate = {
            '$set': {
                title: blog.title,
                filter: filter,
                day: blog.day,
                subtxt: blog.subtxt,
                sortIdx: blog.sortIdx
            }
        };
        Abstract.findOneAndUpdate({
            _id: abstractId
        }, abstractUpdate, {new: true}, function(err, abstract){ // abstract is the updated abstract
            if(err){
                return console.log(err);
            }
            articleId = abstract.articleId
            var articleUpdate = {
                '$set': {
                    title: blog.title,
                    fulltxt: blog.fulltxt,        
                }
            };
            Article.findOneAndUpdate({
                _id: articleId
            }, articleUpdate, {new: true}, function(err, article){
                if(err){
                    return console.log(err);
                }
                res.json(article);
            }) 
        })
    })
// <--- DELETE A BLOG --->
// Delete requires both the article and the abstract to be deleted. 
// The id in the url is the id of the abstract
    var fs = require('fs');
    router.delete('/blog/:_id', sessionCheck, function(req, res){ // the id in the url is the id of the abstract
        // Delete both article and corresponding abstract
        var abstractId = req.params._id;        
        Abstract.findOne( { _id: abstractId } ).exec( function(err, abstract) {
            var articleId = abstract.articleId; // get article id from the abstract.
            console.log(abstract);
            if(err){
                return console.log(err);
            }
            Abstract.remove( { _id: abstractId }, function(err){
                if(err){
                    return console.log(err);
                }
                // now delete article
                Article.remove( { _id: articleId }, function(err){
                    if(err){
                        return console.log(err);
                    }
                    return res.send('success');            
                });            
            });
        });        
    });
// <--- GET ALL ABSTRACTS IN DECENDING ORDER OF INDX (i.e date) --->
router.get('/abstracts', function(req, res) { 
    Abstract.find().sort({sortIdx: -1}).exec(function (err, abstracts) {
        if(err){
            return console.log(err);
        }
        res.json(abstracts);
    });
});
// <--- GET AN ARTICLE --->
// gets an article using the abtstact id
router.get('/article/:id', function(req, res) {
    var id = req.params.id;                  
    Abstract.findOne( { _id: id } , function(err, abstract){ // function called after findOne completes
        if(err){            
            return res.send(500, err);    
        } 
        if( abstract ) {
            var articleId = abstract.articleId;
            Article.findOne({_id: articleId}, function(err, article){
                if(err){
                    return res.send(500, err);
                } else {
                    return res.send(article);
                }
            });            
        } else {
            return res.send(500, err);
        }
    });
});
module.exports = router; // don't forget to return it