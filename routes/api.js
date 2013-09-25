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

// list events
api.listEvents = function(req, res) {
  var _id = req.params._id;
  var from = req.query.from;
  var maxId = req.query.max_id;
  var minId = req.query.min_id;

  // make sure id is valid
  if(!misc.isObjectId(_id)) return resh.send(res, createError(400, 'invalid event id'));

  async.waterfall([

    // get the event!
    function(done) { Event.findById(_id, done); },

    // page the media!
    function(daevent, done) {
      if(!daevent) return done(createError(404, 'event not found'));

      // build the query
      var query = Media.find()
        .where('id').in(daevent.media)
        .sort('-mediaId')
        .limit(20);

      // add paging conditions
      if(from) { 
        var parsed = misc.parseMediaId(from);
        query.where('mediaId').lt(parsed.mediaId);
      }
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
    }

  ], function(err, results) {
      if(err) return resh.send(res, err);
      // _.each(results, function(r) { console.log(r.id); });
      resh.send(res, err, results);
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