var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var config = require('./config.js');
var app = express();
// <--- Passport --->
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user.js');
// Configure passport local strategy 
passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ username: username.toLowerCase() }, function (err, user) {
                if (err) { 
                    return done(err); 
                }
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                if (!user.validPassword(password)) {
                    return done(null, false, { message: 'Incorrect password.' });
                }
                return done(null, user);
            }
        );
    }
));
// Configure passport session management serialise/deserialise functions
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});
// <--- MONGO CONNECTION --- >
var mongoose = require('mongoose');
mongoose.connect(config.dbLogin);
var db = mongoose.connection;
db.on('error', console.error.bind(console, '# MongoDB - connection error: '));
// <--- MONGO STORE ---> // used by authentication 
const MongoStore = require('connect-mongo')(session);
// <--- ROUTES --->
var index = require('./routes/index');
var users = require('./routes/users');
var api = require('./routes/api');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// <--- MIDDLEWARE --->
app.use(logger('dev'));
app.use(bodyParser.json()); // gives req.body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'mySecretString',
    resave: false,
    saveUninitialized: false,   
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 2}, // 2 days
    //cookie: {maxAge: 1000 * 60 * 60 * 1 * 1}, // 1 hour
    store: new MongoStore({mongooseConnection: db})  // ttl - time to leave
}))
// <--- PASSPORT --->
app.use(passport.initialize());
app.use(passport.session());  // must be placed after session
// <--- APP --->
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', api); // api with passport protection
app.get('*', function(req, res){
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
}) 
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
module.exports = app;