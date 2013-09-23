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

  // make sure id is valid
  if(!misc.isObjectId(_id)) return resh.send(res, createError(400, 'invalid event id'));

  async.waterfall([

    // get the event!
    function(done) { Event.findById(_id, done); },

    // page the media!
    function(daevent, done) {
      if(!daevent) return done(createError(404, 'event not found'));

      // parse the media id
      var parts = from.split('_');
      var fromMediaId = misc.normalizeId(parts[0]);

      // build the query
      var query = Media.find()
        .where('id').in(daevent.media)
        .sort('-mediaId')
        .limit(20);

      // add from condition if it's specified
      if(from) {
        query.where('mediaId').lt(fromMediaId)
      }

      // and execute query!
      query.exec(done);
    }

  ], function(err, results) {
      if(err) return resh.send(res, err);
      _.each(results, function(r) {
        console.log(r.id);
      })
      resh.send(res, err, results);
  });
};


/////////////
// Helpers //
/////////////

function createError(code, msg) {
  var error = new Error;
  error.code = code;
  error.message = msg;
  return error;
}


module.exports = api;