////////////////
// User Model //
////////////////

// libs
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var helpers = require('./helpers')

// define schema
var schema = new Schema({

  id: { type: String, required: true },
  email: { type: String, required: true },
  first: { type: String, required: true },
  last: { type: String, required: true },
  joined: { type: Date, default: Date.now },

  // password stuff
  hash: { type: String, required: true, select: false },
  salt: { type: String, required: true, select: false }

}, { strict: true });

// define indexes
schema.index({ 'id': 1 }, { unique: true });
schema.index({ 'email': 1 }, { unique: true });

// virtual to generate the hash and salt when setting the password
schema.virtual('password').set(function(password) {
  var salt = helpers.rand();
  var hash = helpers.hash(password, salt); 
  this.salt = salt;
  this.hash = hash;
});

// sanitize the user id and email before saving
schema.pre('save', function(next) {
  this.id = this.id.trim().toLowerCase();
  this.email = this.email.trim().toLowerCase();
  next();
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
        var hash = helpers.hash(password, salt);

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
module.exports = mongoose.model('User', schema);