/////////////////
// Cron Script //
/////////////////

// runs periodically to retrieve latest tagged media from instagram

// libs
var async = require('async');
var moment = require('moment');
var mongoose = require('mongoose');
var config = require('../config');
var Event = require('../models/event');
var User = require('../models/passport-user');
var Medium = require('../models/medium');
var insta = require('../helpers/instagram');
var TagClient = insta.TagClient;

// connect to db before doing anyting
mongoose.connect(config.db, start);

// start cron script
function start(err) {
  if(err) throw err;

  async.waterfall([

    // get events happening right now!
    function(done) { Event.getCurrent(done); },

    // for each one of these events, use the tags to pull instagram api
    function(events, done) { async.eachSeries(events, processEvent, done); }

  ], function(err, results) {
    if(err) throw err;
    console.log('done updating media db!');
    process.exit();
  });
}

// process an event
function processEvent(ev, complete) {

  console.log('processing event %s', ev.name);
  async.waterfall([

    // first get the media
    function(done) { downloadMedia(ev, done); },

    // then process the instagram data
    function(media, done) {
      async.eachSeries(media, function(medium, mediumDone) {
        processMedium(ev, medium, mediumDone);
      }, done);
    },

    // finally also save the event object, which gets modified by processMedium() by adding to the media array
    function(done) { ev.save(done); }

  ], complete);
}

// downloads all availabe media for this event
function downloadMedia(ev, complete) {
  var client = new TagClient(ev._owner.accessToken, ev.tag);
  var results = [];
  var currentMedia = null;

  async.doWhilst(

    // the action - downloads the next page of data from instagram
    function(done) {
      console.log(client.url);
      client.fetch(function(err, media) {
        if(err) return done(err);
        currentMedia = media;
        results = results.concat(media.data);
        done();
      });
    },

    // since the instagram response is always in reverse chronological order, i.e. newest comes first
    // if the oldest entry of the current instagram response is newer than the start date of the event
    // then we want to download the next page of data!
    function() { 
      return client.url && currentMedia.startDate() > ev.start; 
    },

    // gets called when there's an error or when download is complete
    function(err) {
      if(err) return complete(err);
      complete(null, results);
    }
  );
}

// process a single medium (image or video)
function processMedium(ev, medium, complete) {

  // make sure the image/video is in the event date range
  var created = moment(medium.data.created_time * 1000).startOf('day').toDate();
  if(ev.start <= created && created <= ev.end) {

    // add this image/video to the event
    ev.media.addToSet(medium.data.id);

    // and update the image/video cache
    Medium.update(
      { id: medium.data.id },
      medium.data,
      { multi: false, upsert: true },
      complete
    );
  } else { setImmediate(complete); }
}