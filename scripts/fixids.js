//////////////
// fixid.js //
//////////////

// script to fix the media id of all media in the db

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

	var saving = 0;
	var stream = Media.find().stream();
	stream.on('data', function(m) {

		// skip if already fixed
		if(m.mediaId && m.machineId) return;

		saving++;
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

		if(saving === 0) onComplete();

	});

	// common event handlers
	function onSaveComplete(err, saved) {
		saving--;

		if(err) console.error(err);
		console.log('saved %s', saved.id);

		if(saving === 0) onComplete();
	}

	function onComplete() {
		console.log('Fixed all ids!');
		process.exit(0);
	}
}