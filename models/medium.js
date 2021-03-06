//////////////////
// Medium Model //
//////////////////

// libs
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Mixed = Schema.Types.Mixed;

// schema definition
var schema = new Schema({

  // parsed fields
  // these fields are always going to be 50 digi numeric string
  // query accordingly
  mediaId: { type: String, required: true },
  machineId: { type: String, required: true },

  // fields straight from instagram api
  id: { type: String, required: true },
  type: { type: String, reuqired: true }, 
  created_time: { type: Number, required: true },
  tags: [ String ],
  location: String,
  user: Mixed,
  comments: Mixed,
  likes: Mixed,
  images: Mixed,
  caption: Mixed,
  users_in_photos: [ Mixed ]

}, { strict: false, _id: false });

// indexes definition
schema.index({ id: 1, mediaId: 1, machineId: 1 }, { unique: true });
schema.index({ mediaId: -1, id: 1 });

// export
module.exports = mongoose.model('Medium', schema);