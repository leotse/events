//////////////////////////////////////
// Instagram Authentication Helpers //
//////////////////////////////////////

// instagram authentication related helpers
var auth = {};

// libs
var async = require('async');
var PassportUser = require('../models/passport-user');

// authenticates the user 
auth.authenticate = function(accessToken, refreshToken, profile, complete) {

  var id = profile.id;
  async.waterfall([

    // see if user exist
    function(done) { PassportUser.findOne(profile.id, done); },

    // create or update user
    function(user, done) {
      var updateUser = user;
      if(!user) {
        updateUser = new PassportUser(profile);
        updateUser.accessToken = accessToken;
      } else {
        updateUser.provider = profile.provider;
        updateUser.id = profile.id;
        updateUser.displayName = profile.displayName;
        updateUser.name = profile.name;
        updateUser.accessToken = accessToken;
        updateUser._raw = profile._raw;
        updateUser._json = profile._json;
      }
      updateUser.save(done);
    }

  ], complete);
}

// serialize user
auth.serializeUser = function(user, done) {
  done(null, user._id);
};

// deserialize user
auth.deserializeUser = function(_id, done) {
  PassportUser.findById(_id, function(err, user) {
    if(err) return done(err);
    return done(null, user);
  });
};

module.exports = auth;