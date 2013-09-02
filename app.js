//////////
// Main //
//////////

// libs
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var express = require('express');
var validator = require('express-validator');
var routes = require('./routes');
var userRoutes = require('./routes/user');
var config = require('./config');

// init express app
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(validator());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// routes
app.get('/', routes.index);
app.get('/register', userRoutes.register);
app.post('/register', userRoutes.create);

// connect to db then start server
// connect to db
mongoose.connect(config.db, function(err) {
  if(err) throw err;
  http.createServer(app).listen(app.get('port'), function(){
    console.log('ievents server listening on port ' + app.get('port'));
  });
});