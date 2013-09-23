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


// delete media
routes.del = function(req, res) {
  var alias = req.params.alias;
  var itemsString = req.body.items;

  // if there are no items, just return
  if(!itemsString || itemsString.length === 0) return res.redirect('/albums/' + alias);

  async.waterfall([

    // get the event
    function(done) { 
      Alias.findOne()
        .where('alias', alias)
        .populate('_event')
        .exec(done); 
    }, 

    // and remove the pictures from it
    function(alias, done) {
      if(!alias) return done(createError(404, 'album not found'));

      // get items to be removed from the form
      var items = itemsString.split(',');
      var ev = alias._event;
      _.each(items, function(item) { 
        ev.media.pull(item); 
        ev.removed.addToSet(item);
      });
      ev.save(done);
    }

  ], function(err, result) {
    if(err) return resh.send(res, err);
    res.redirect('/albums/' + alias);
  })
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