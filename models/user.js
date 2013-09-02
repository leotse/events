////////////////
// User Model //
////////////////

// libs
var crypto = require('crypto');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var helpers = require('./helpers')

// schema definition
var schema = new Schema({

  id: { type: String, required: true },
  first: { type: String, required: true },
  last: { type: String, required: true },
  joined: { type: Date, default: Date.now },

  // password stuff
  hash: { type: String, required: true, select: false },
  salt: { type: String, required: true, select: false }

}, { strict: true });

// indexes definition

// virtuals to change password
schema.virtual('password').set(function(password) {
  var salt = crypto.rand();
  var hash = crypto.hash(password, salt); 
  this.salt = salt;
  this.hash = hash;
});


// static to create a user
schema.statics.create = function(args, callback) {
  var UserModel = this.model('User');
  var user = new UserModel(args);
  user.password = args.password;
  user.save(callback);
};

// static to login a user
schema.statics.login = function(username, password, callback) {
  var User = this.model('User');

  // find the user
  User.findOne()
    .select('cid username fullname email joined hash salt')
    .where('username', username)
    .exec(function(err, user) {
      if(err) callback(error.dbError(err));
      else if(!user) callback(error.userNotFound());
      else {

        // check the password!
        var salt = user.salt
        var hash = crypto.hash(password, salt);

        if(hash !== user.hash) return callback(error.passwordMismatch());
        else { 
          // remove unwanted fields
          var userdoc = user._doc;
          delete userdoc.salt;
          delete userdoc.hash;
          return callback(null, userdoc);
        }
      }
  });
};

// export
module.exports = schema;