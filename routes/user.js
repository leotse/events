/////////////////
// User Routes //
/////////////////
var routes = {};

// libs
var resh = require('../helpers/res');
var User = require('../models/user');

// GET /login
routes.login = function(req, res) {
  res.render('user/login', { errors: req.flash('error') });
};

// POST /login
routes.authenticate = function(req, res) {
  var body = req.body;
  var id = body.id;
  var pass = body.password;

  User.login(id, pass, function(err, user) {
    if(err) return onDBError(req, res, err, 'user/login');
    if(!user) return onDBError(req, res, new Error('The username or password you entered is incorrect'), 'user/login');
    res.redirect('/');
  });
};

// GET /register
routes.register = function(req, res) {
  res.render('user/register');
};

// POST /register
routes.create = function(req, res) {
  
  // form validations
  req.assert('id', 'User ID must not be empty').notEmpty();
  req.assert('id', 'User ID must be b/w 3-20 characters').len(3, 20);
  req.assert('first', 'First name not be empty').notEmpty();
  req.assert('first', 'First name must be b/w 2-20 characters').len(2, 20);
  req.assert('last', 'Last name not be empty').notEmpty();
  req.assert('last', 'Last name must be b/w 2-20 characters').len(2, 20);
  req.assert('email', 'Eamil must not be empty').notEmpty();
  req.assert('email', 'Invalid email').isEmail();
  req.assert('password', "Password not be empty").notEmpty();
  req.assert('password', "Password must b/w 6-20 characters").len(6, 20);
  req.assert('password2', "Passwords do not not match").equals(req.body.password);

  // back to register page if there are errors
  var errors = req.validationErrors();
  if(errors) return onError(req, res, errors, 'user/register');

  // create user!
  var user = new User(req.body);
  user.save(function(err, saved) {
    if(err) return onDBError(req, res, err, 'user/register');
    res.redirect('/');
  });
};

/////////////
// Helpers //
/////////////

// replace the db error with a more user friendly message
function onDBError(req, res, err, view) {
  var error = { msg: err.message || 'Unknown error' };
  if(err.code === 11000) {
    if(err.err.indexOf('users.$id') >= 0) error = { msg: 'User ID already in use' };
    else if(err.err.indexOf('users.$email') >= 0) error = {msg: 'Email already in use' };
  }

  console.error(err);
  onError(req, res, [ error ], view);
}

// helper to handle form errors
function onError(req, res, errors, view) {
  res.render(view, { user: req.body, errors: errors }); 
}

// export
module.exports = routes;