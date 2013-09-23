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

  async.auto({

    // retrieve the alias
    alias: function(done) {
      Alias.findOne()
        .where('alias', alias)
        .populate('_event')
        .exec(done);
    },

    // render the 20 newest item of this event
    media: [ 'alias', function(done, results) {

      var alias = results.alias;
      if(!alias) return done(res, createError(404, 'album not found'));

      var ev = alias._event;
      var media = ev.media;
      Media.find()
        .where('id').in(media)
        .sort('-id')
        .limit(20)
        .exec(done);
    }]

  }, function(err, results) {
    if(err) return resh.send(res, err);
    
    var ev = results.alias._event;
    var media = results.media;
    res.render('album', { event: ev, media: media });
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