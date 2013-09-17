//////////////////
// Misc Helpers //
//////////////////

// contains all the misc helpers
var misc = {};

// libs
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

// check if the input string is a valid object id
misc.isObjectId = function(id) {
	try {
		var oid = ObjectId.fromString(id);
		return true;
	} catch(ex) {
		return false;
	}
};

module.exports = misc;