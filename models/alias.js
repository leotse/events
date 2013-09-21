/////////////////
// Alias Model //
/////////////////

// the public alias for an event

// libs
var _ = require('underscore');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

// schema definition
var schema = new Schema({

  _event: { type: ObjectId, ref: 'Event', required: true },
  alias: { type: String, required: true },
  created: { type: Date, default: Date.now }

}, { strict: true });

// indexes definition
schema.index({ alias: 1 }, { unique: true });
schema.index({ _event: 1 });

// export
module.exports = mongoose.model('Alias', schema);