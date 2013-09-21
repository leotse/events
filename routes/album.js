//////////////////
// Album Routes //
//////////////////

// contains the public album routes
var routes = {};

// libs
var async = require('async');
var resh = require('../helpers/res');
var misc = require('../helpers/misc');
var Alias = require('../models/alias');

// list events
routes.show = function(req, res) {
  var alias = req.params.alias;

  Alias.findOne()
    .where('alias', alias)
    .exec(function(err, alias) {
      if(err) return resh.send(res, err);
      if(!alias) return resh.send(res, createError(404, 'album not found'));

      res.send('showing album');
    });
}


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