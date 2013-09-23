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

// helper to add leading zeroes to the id
// this is a workaround for the javascript limitations with big numbers
// will make the input 50 digits with leading zeroes
misc.normalizeId = function(id) {
  var i, length = 50 - id.length, leading = '';
  for(i = 0; i < length; i++) {
    leading += 0;
  }
  return leading + id;
}

module.exports = misc;