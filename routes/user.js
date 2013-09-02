/////////////////
// User Routes //
/////////////////
var routes = {};

// libs
var User = require('../models/user');

// GET /register
routes.register = function(req, res) {
  res.render('user/register');
};

// POST /register
routes.create = function(req, res) {
  
  // validations
  req.assert('id', 'User ID must be b/w 3-20 characters').len(3, 20);
  req.assert('first', 'First name must be b/w 2-20 characters').len(2, 20);
  req.assert('last', 'Last name must be b/w 2-20 characters').len(2, 20);
  var errors = req.validationErrors();
  if(errors) return res.render('user/register', { errors: errors, user: req.body });

  // create user
  res.send('done');
};

// export
module.exports = routes;