////////////////////
// Crypto Helpers //
////////////////////
var helpers = {};


// libs
var crypto = require('crypto');


// generate random number
helpers.rand = function() {
  var whirlpool = crypto.createHash('whirlpool');
  return crypto.randomBytes(256).toString('hex');
};


// hash password + salt
helpers.hash = function(password, salt) {
  var whirlpool = crypto.createHash('whirlpool')
  , ps = salt + '-' + password
  , hash = whirlpool.update(ps).digest('hex')
  return hash;
};


// helper to generate api key and secrert
helpers.randBytes = function(length) {
  var buf = crypto.randomBytes(length);
  return buf.toString('hex');
};


// export
module.exports = helpers;