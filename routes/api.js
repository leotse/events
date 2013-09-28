////////////////
// API Routes //
////////////////

// contains all the api related routes
var api = {};

// libs
var _ = require('underscore');
var async = require('async');
var resh = require('../helpers/res');
var misc = require('../helpers/misc');
var Event = require('../models/event');
var Media = require('../models/medium');
var EventMedia = require('../models/eventmedium');

// list events
api.listEvents = function(req, res) {
  var _id = req.params._id;
  var from = req.query.from;
  var maxId = req.query.max_id;
  var minId = req.query.min_id;

  // make sure id is valid
  if(!misc.isObjectId(_id)) return resh.send(res, createError(400, 'invalid event id'));

  // testing new schema
  async.waterfall([

    // get the event's media
    function(done) { 
      var query = EventMedia.find()
        .where('_event', _id)
        .sort('-mediaId')
        .limit(20);

      // apply the min and max id conditions
      if(maxId) {
        var parsed = misc.parseMediaId(maxId);
        query.where('mediaId').lt(parsed.mediaId);
      }
      if(minId) { 
        var parsed = misc.parseMediaId(minId);
        query.where('mediaId').gt(parsed.mediaId);
      }

      // and execute query!
      query.exec(done);
    },

    // get the media objects
    function(em, done) {
      var ids = _.pluck(em, 'id');
      Media.find()
        .where('id').in(ids)
        .exec(done);
    }

  ], function(err, results) {
      if(err) return resh.send(res, err);
      var sorted = _.sortBy(results, function(item) { return -item.mediaId; });
      resh.send(res, err, sorted);

      // // debug output
      // _.each(sorted, function(r) { console.log(r.id); });
  });
};


/////////////
// Helpers //
/////////////



// create an error object with the proper error code
function createError(code, msg) {
  var error = new Error;
  error.code = code;
  error.message = msg;
  return error;
}


module.exports = api;