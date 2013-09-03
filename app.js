//////////
// Main //
//////////

// libs
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var express = require('express');
var MongoStore = require('connect-mongo')(express);
var validator = require('express-validator');
var flash = require('connect-flash');
var ensureAuth = require('connect-ensure-login').ensureLoggedIn;
var passport = require('passport');
var local = require('passport-local');
var auth = require('./helpers/auth');
var routes = require('./routes');
var userRoutes = require('./routes/user');
var eventRoutes = require('./routes/event');
var config = require('./config');

// init express app
var app = express();

// init passport
passport.use(new local.Strategy(auth.authenticate));
passport.serializeUser(auth.serializeUser);
passport.deserializeUser(auth.deserializeUser);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ 
  secret: config.session.secret,
  store: new MongoStore({ url: config.session.db })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(validator());
app.use(flash());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// general routes
app.get('/', ensureAuth('/login'), routes.index);

// event routes
app.get('/events/add', ensureAuth('/login'), eventRoutes.addView);
app.get('/events/:_id', ensureAuth('/login'), eventRoutes.get);
app.get('/events', ensureAuth('/login'), eventRoutes.list);
app.put('/events', ensureAuth('/login'), eventRoutes.add);
app.del('/events', ensureAuth('/login'), eventRoutes.del);

// auth routes
app.get('/register', userRoutes.register);
app.post('/register', userRoutes.create);
app.get('/login', userRoutes.login);
app.post('/login', passport.authenticate('local', { 
  successReturnToOrRedirect: '/', 
  failureRedirect: '/login', 
  failureFlash: true 
}));

// connect to db then start web server
mongoose.connect(config.db, function(err) {
  if(err) throw err;
  http.createServer(app).listen(app.get('port'), function(){
    console.log('ievents server listening on port ' + app.get('port'));
  });
});