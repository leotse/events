/////////////////
// Cron Script //
/////////////////

// runs periodically to retrieve latest tagged media from instagram

// libs
var async = require('async');
var moment = require('moment');
var mongoose = require('mongoose');
var config = require('../config');
var User = require('../models/passport-user');
var Event = require('../models/event');
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

  ], function(err) {
    if(err) throw err;
    console.log('done updating media db!');
    process.exit();
  });
}

// process an event
function processEvent(ev, processEventComplete) {
  console.log('processing event %s', ev.name);

  var client = new TagClient(ev._owner.accessToken, ev.tag);
  var currentMedia = null;

  async.doWhilst(

    // the action
    function(actionDone) {
      async.waterfall([

        // download a page of data from instagram
        function(done) { 
          console.log(client.url);
          client.fetch(done); 
        },

        // process the media data
        function(media, done) {
          currentMedia = media;
          async.eachSeries(media.data, function(medium, mediumDone) {
            processMedium(ev, medium, mediumDone);
          }, done);
        },

        // finally save the event object, which gets modified by processMedium() by adding to the media array
        function(done) { ev.save(done); }

      ], actionDone);
    },

    // the condition -
    // since the instagram response is always in reverse chronological order, i.e. newest comes first
    // if the oldest entry of the current instagram response is newer than the start date of the event
    // then we want to download the next page of data!
    function() { return client.url && currentMedia.startDate() > ev.start; },

    // gets called when there's an error or when download is complete
    processEventComplete
  );
}

// process a single medium (image or video)
function processMedium(ev, medium, complete) {

  // add this image/video to the event
  ev.media.addToSet(medium.data.id);

  // update the image/video cache
  Medium.update(
    { id: medium.data.id },
    medium.data,
    { multi: false, upsert: true },
    complete
  );
}