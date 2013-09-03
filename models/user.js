////////////////
// User Model //
////////////////

// libs
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
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
schema.statics.login = function(id, password, callback) {
  var User = this.model('User');

  // find the user
  User.findOne()
    .select('cid id email first last joined hash salt')
    .where('id', id)
    .exec(function(err, user) {
      if(err) return callback(err);
      if(!user) return callback(null, false);

      // check the password!
      var salt = user.salt;
      var hash = helpers.hash(password, salt);
      if(hash !== user.hash) return callback(null, false);

      // remove secret fields then return
      var userObj = user.toObject();
      delete userObj.salt;
      delete userObj.hash;
      callback(null, userObj);
  });
};

// export
module.exports = mongoose.model('User', schema);