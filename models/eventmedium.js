////////////////////////
// Event Medium Model //
////////////////////////

// libs
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Mixed = Schema.Types.Mixed;
var misc = require('../helpers/misc');

// schema definition
var schema = new Schema({

  _event: { type: ObjectId, required: true },
  id: { type: String, reuqired: true },

  // parsed id for better sorting support
  mediaId: { type: String },
  machineId: { type: String }

}, { strict: false, _id: false });

// indexes definition
schema.index({ _event: 1, mediaId: 1, machineId: 1 }, { unique: true });

// generate media id and machine id before saving
schema.pre('save', function(next) {
  var parsed = misc.parseMediaId(this.id);
  this.mediaId = parsed.mediaId;
  this.machineId = parsed.machineId;
  next();
});

// export
module.exports = mongoose.model('EventMedium', schema);