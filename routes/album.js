//////////////////
// Album Routes //
//////////////////

// contains the public album routes
var routes = {};

// libs
var _ = require('underscore');
var async = require('async');
var resh = require('../helpers/res');
var misc = require('../helpers/misc');
var Alias = require('../models/alias');
var Media = require('../models/medium');

// list events
routes.show = function(req, res) {
  var alias = req.params.alias;
  Alias.findOne()
    .where('alias', alias)
    .populate('_event')
    .exec(function(err, alias) {
      if(err) return resh.send(res, err);
      if(!alias) return resh.send(res, createError(404, 'album not found'));
      res.render('album', { event: alias._event });
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


module.exports = routes;