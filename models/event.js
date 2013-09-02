/////////////////
// Event Model //
/////////////////

// libs
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

// schema definition
var schema = new Schema({

  _owner: { type: ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  desc: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  hashtag: { type: String, required: true },
  enabled: { type: Boolean, required: true },
  created: { type: Date, default: Date.now }

}, { strict: true });

// indexes definition

// export
module.exports = schema;