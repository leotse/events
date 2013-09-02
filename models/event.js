/////////////////
// Event Model //
/////////////////

// libs
var _ = require('underscore');
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
  enabled: { type: Boolean, default: true },
  created: { type: Date, default: Date.now },
  tags: [ String ]

}, { strict: true });

// indexes definition
schema.index({ _owner: 1 });

// sanitize hashtags
schema.virtual('hashtags').set(function(hashtags) {
  if(!hashtags || hashtags.length === 0) return this.tags = [];
  var parts = hashtags.split('#');
  var clean, tags = []
  _.each(parts, function(tag) {
    clean = tag.trim();
    if(clean.length > 0) tags.push(tag.trim());
  });
  this.tags = tags;
});

// export
module.exports = mongoose.model('Event', schema);