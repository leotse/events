////////////////
// API Routes //
////////////////

// contains all the api related routes
var api = {};

// libs
var _ = require('underscore');
var async = require('async');
var resh = require('../helpers/res');
var Event = require('../models/event');
var Media = require('../models/medium');

// list events
api.listEvents = function(req, res) {
  var _id = req.params._id;
  var from = req.query.from;

  async.waterfall([

    // get the event!
    function(done) { Event.findById(_id, done); },

    // page the media!
    function(daevent, done) {
      if(!daevent) return done(new Error('event not found'));
      
      var media = daevent.media;
      var sorted = _.sortBy(media, function(m) { 
        var parts = m.split('_');
        var num = Number(parts[0]);
        return num;
      });

      var fromIndex = Math.max(-1, sorted.indexOf(from)) + 1;
      var toIndex = Math.min(sorted.length, fromIndex + 20);
      var ids = sorted.slice(fromIndex, toIndex);

      // get these media from db!
      Media.find()
        .where('id').in(ids)
        .exec(done);
    }

  ], function(err, results) {
      if(err) return resh.send(res, err);

      // sort and return results
      var sorted = _.sortBy(results, function(r) { 
        var parts = r.id.split('_');
        var num = Number(parts[0]);
        return num;
      });
      resh.send(res, err, sorted);
  });
};


module.exports = api;