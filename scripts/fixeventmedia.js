//////////////
// fixid.js //
//////////////

// script to fix the media id of all media in the db

//libs
var async = require('async');
var mongoose = require('mongoose');
var config = require('../config');
var misc = require('../helpers/misc');
var Event = require('../models/event');
var EventMedium = require('../models/eventmedium');

// connect to db
mongoose.connect(config.db, start);

// start script
function start(err) {
	if(err) throw err;

	// iterate events
	Event.find().exec(function(err, events) {
		if(err) throw err;
		async.eachSeries(events, processEvent, function(err, result) {
			if(err) throw err;
			console.log('done!');
			process.exit();
		});
	});

	function processEvent(event, done) {
		async.each(event.media, function(mediaId, mediaDone) {
			processMedia(event, mediaId, mediaDone);
		}, done);
	}

	function processMedia(event, mediaId, done) {
		var parsed = misc.parseMediaId(mediaId);
		EventMedium.findOneAndUpdate(
			{ _event: event._id, id: mediaId },
			{ _event: event._id, id: mediaId, mediaId: parsed.mediaId, machineId: parsed.machineId },
			{ upsert: true },
			done
		);
	}
}