//////////////////////////
// Authencation Helpers //
//////////////////////////

// authentication related helpers
var auth = {};

// libs
var User = require('../models/user');

// authenticates the user 
auth.authenticate = function(id, password, done) {
  User.login(id, password, function (err, user) {
    if(err) return done(err);
    if(!user) return done(null, false, { message: 'The username or password you entered is incorrect' });
    return done(null, user);
  });
};

// serialize user
auth.serializeUser = function(user, done) {
  console.log('serialize');
  done(null, user._id);
};

// deserialize user
auth.deserializeUser = function(_id, done) {
  console.log('deserialize');
  User.findById(_id, function(err, user) {
    if(err) return done(err);
    return done(null, user);
  });
};

module.exports = auth;