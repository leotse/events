//////////////
// fixid.js //
//////////////

// script to fix the media id of all media in the db

// POTENTIALLY DESTRUCTIVE - POINTS SCRIPT TO PROD DB!
// process.env.NODE_ENV = 'production';

//libs
var mongoose = require('mongoose');
var config = require('../config');
var misc = require('../helpers/misc');
var Media = require('../models/medium');

// connect to db
mongoose.connect(config.db, start);

// start script
function start(err) {
	if(err) throw err;

	var stream = Media.find().stream();
	stream.on('data', function(m) {

		// skip if already fixed
		if(m.mediaId && m.machineId) return;

		var id = m.id;
		var parts = id.split('_');
		var mediaId = misc.normalizeId(parts[0]);
		var machineId = misc.normalizeId(parts[1]);

		m.mediaId = mediaId;
		m.machineId = machineId;
		m.save(onSaveComplete);

	}).on('error', function(err) {

		console.error(err);
		process.exit(1);

	}).on('close', function() {

		console.log('Fixed all ids!');
		process.exit(0);

	});

	// common event handlers
	function onSaveComplete(err, saved) {
		if(err) console.error(err);
		console.log('saved %s', saved.id);
	}
}