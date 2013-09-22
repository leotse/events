/////////////////
// Event Model //
/////////////////

// libs
var _ = require('underscore');
var moment = require('moment');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

// schema definition
var schema = new Schema({

  _owner: { type: ObjectId, ref: 'PassportUser', required: true },
  name: { type: String, required: true },
  desc: { type: String, required: true },
  tag: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  enabled: { type: Boolean, default: true },
  created: { type: Date, default: Date.now },
  media: [{ type: String }],
  removed: [{ type: String }]

}, { strict: true });

// indexes definition
schema.index({ _owner: 1 });
schema.index({ start: 1, end: 1 });

// static to get current events
schema.statics.getCurrent = function(callback) {
  var now = moment().startOf('day');
  var Event = this.model('Event');
  Event.find()
    .where('start').lte(now)
    .where('end').gte(now)
    .populate('_owner')
    .sort({ $natural: 1 })
    .exec(callback);
};

// export
module.exports = mongoose.model('Event', schema);