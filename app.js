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
var instagram = require('passport-instagram');
var auth = require('./helpers/auth');
var insta_auth = require('./helpers/insta-auth');
var urls = require('./helpers/urls');
var routes = require('./routes');
var userRoutes = require('./routes/user');
var eventRoutes = require('./routes/event');
var config = require('./config');

// init express app
var app = express();

// init passport
// passport.use(new local.Strategy(auth.authenticate));
passport.use(new instagram.Strategy({
    clientID: config.instagram.key,
    clientSecret: config.instagram.secret,
    callbackURL: config.instagram.callback
  }, insta_auth.authenticate 
));
passport.serializeUser(insta_auth.serializeUser);
passport.deserializeUser(insta_auth.deserializeUser);

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
app.get(urls.HOME, ensureAuth(urls.LOGIN), routes.index);

// event routes
app.get('/events/add', ensureAuth(urls.LOGIN), eventRoutes.addView);
app.get('/events/:_id', ensureAuth(urls.LOGIN), eventRoutes.get);
app.get('/events/:_id/download', ensureAuth(urls.LOGIN), eventRoutes.download);
app.get('/events', ensureAuth(urls.LOGIN), eventRoutes.list);
app.put('/events', ensureAuth(urls.LOGIN), eventRoutes.add);
app.del('/events', ensureAuth(urls.LOGIN), eventRoutes.del);

// auth routes
// custom reigster/login not used anymore, migrating to instagram
// app.get('/register', userRoutes.register);
// app.post('/register', userRoutes.create);
// app.get('/login', userRoutes.login);
// app.post('/login', passport.authenticate('local', { 
//   successReturnToOrRedirect: '/', 
//   failureRedirect: '/login', 
//   failureFlash: true 
// }));
app.get(urls.LOGIN, userRoutes.login);
app.get(urls.LOGOUT, userRoutes.logout);
app.get(urls.INSTA_AUTH, passport.authenticate('instagram'));
app.get(urls.INSTA_CALLBACK, passport.authenticate('instagram', { 
  successReturnToOrRedirect: urls.HOME,
  failureRedirect: urls.LOGIN 
}));

// connect to db then start web server
mongoose.connect(config.db, function(err) {
  if(err) throw err;
  http.createServer(app).listen(app.get('port'), function(){
    console.log('ievents server listening on port ' + app.get('port'));
  });
});