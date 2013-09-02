/////////////////
// User Routes //
/////////////////
var routes = {};

// libs
var resh = require('../helpers/res');
var User = require('../models/user');

// GET /register
routes.register = function(req, res) {
  res.render('user/register');
};

// POST /register
routes.create = function(req, res) {
  
  // form validations
  req.assert('id', 'User ID must be b/w 3-20 characters').len(3, 20);
  req.assert('first', 'First name must be b/w 2-20 characters').len(2, 20);
  req.assert('last', 'Last name must be b/w 2-20 characters').len(2, 20);
  req.assert('password', "Password must b/w 6-20 characters").len(6, 20);
  req.assert('password2', "Passwords do not not match").equals(req.body.password);

  // back to register page if there are errors
  var errors = req.validationErrors();
  if(errors) return res.render('user/register', { errors: errors, user: req.body });

  // create user!
  var user = new User(req.body);
  user.save(function(err, saved) {
    if(err) return resh.error(res, err);
    res.redirect('/');
  });
};

// export
module.exports = routes;