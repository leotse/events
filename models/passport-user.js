/////////////////////////
// Passport User Model //
/////////////////////////

// libs
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Types = Schema.Types;
var Mixed = Types.Mixed;
var helpers = require('./helpers');

// define schema
var schema = new Schema({

  provider: { type: String, required: true },
  id: { type: String, required: true } ,
  displayName: { type: String, required: true },
  name: { type: Mixed, required: true },
  accessToken: { type: String, required: true },
  
  // raw response from auth provider
  _raw: { type: String, required: true },
  _json: { type: Mixed, required: true }

}, { strict: true });

// define indexes
schema.index({ id: 1 }, { unique: true });

// export
module.exports = mongoose.model('PassportUser', schema);