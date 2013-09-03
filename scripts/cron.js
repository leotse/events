/////////////////
// Cron Script //
/////////////////

// runs periodically to retrieve latest tagged media from instagram

// libs
var async = require('async');
var mongoose = require('mongoose');
var config = require('../config');
var Event = require('../models/event');
var Medium = require('../models/medium');
var insta = require('../helpers/instagram');

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

  console.log('process event');
  async.waterfall([

    // first get the media
    function(done) { insta.tag(ev.tag, done); },

    // then process the instagram data
    function(media, done) {
      async.eachSeries(media.data(), function(medium, mediumDone) {
        processMedium(ev, medium, mediumDone);
      }, done);
    },

    // finally also save the event object, which gets modified by processMedium() by adding to the media array
    function(done) { ev.save(done); }

  ], complete);
}

// process a single medium (image or video)
function processMedium(ev, medium, complete) {

  // make sure the image/video is in the event date range
  var created = new Date(medium.created_time * 1000);
  if(ev.start < created && created < ev.end) {

    // add this image/video to the event
    ev.media.addToSet(medium.id);

    // and update the image/video cache
    Medium.update(
      { id: medium.id },
      medium,
      { multi: false, upsert: true },
      complete
    );
  } else { setImmediate(complete); }
}