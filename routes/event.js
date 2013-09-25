//////////////////
// Event Routes //
//////////////////
var routes = {};

// libs
var _ = require('underscore');
var util = require('util');
var path = require('path');
var async = require('async');
var request = require('request');
var archiver = require('archiver');
var resh = require('../helpers/res');
var misc = require('../helpers/misc');
var Event = require('../models/event');
var Media = require('../models/medium');
var Alias = require('../models/alias');

// GET /events
routes.list = function(req, res) {
  var user = req.user;

  // get user's events
  Event.find()
    .where('_owner', user._id)
    .sort({ $natural: 1 })
    .exec(function(err, events) {
      if(err) return resh.send(res, err);
      res.render('event/list', { events: events });
    });
};

// GET /events/:_id
routes.get = function(req, res) {

  // make sure id is valid
  var _id = req.params._id;
  if(!misc.isObjectId(_id)) return resh.send(res, createError(400, 'invalid event id'));

  async.auto({

    // first get the event object
    event: function(done) { Event.findById(req.params._id, done); },

    // then get the media associated to this event
    media: [ 'event', function(done, results) {
      var event = results.event;

      // make sure event is found
      if(!event) return done(createError(404, 'event not found'));

      // and get all the media for this event
      Media.find()
        .where('id').in(event.media)
        .sort('-mediaId')
        .limit(20)
        .exec(done)
    }]

  }, function(err, results) {
    if(err) return resh.send(res, err);

    // finally render the page!
    var event = results.event;
    var media = results.media;
    res.render('event/get2', { event: event, media: media });
  });
};

// DELETE /events/:_id/media
routes.removeMedia = function(req, res) {
  var eventId = req.params._id;
  var itemsString = req.body.items;

  // if there are no items, just return
  if(!itemsString || itemsString.length === 0) return res.redirect('/events/' + eventId);

  async.waterfall([

    // get the event
    function(done) { Event.findById(eventId, done); }, 

    // and remove the pictures from it
    function(ev, done) {
      if(!ev) return done(createError(404, 'event not found'));

      // get items to be removed from the form
      var items = itemsString.split(',');
      _.each(items, function(item) { 
        ev.media.pull(item); 
        ev.removed.addToSet(item);
      });
      ev.save(done);
    }

  ], function(err, result) {
    if(err) return resh.send(res, err);
    res.redirect('/events/' + eventId);
  })
}

// GET /events/add
routes.addView = function(req, res) {
  res.render('event/add');
};

// PUT /events
routes.add = function(req, res) {

  // form validations
  req.assert('name', 'Event name must not be empty').notEmpty();
  req.assert('desc', 'Description not be empty').notEmpty();
  req.assert('start', 'Invalid start date').isDate();
  req.assert('end', 'Invalid end date').isDate();
  req.assert('tag', 'Tag must be alphanumeric').isAlphanumeric();

  // back to register page if there are errors
  var errors = req.validationErrors();
  if(errors) return onError(req, res, errors, 'event/add');

  // create event!
  var ev = new Event(req.body);
  ev._owner = req.user._id;
  ev.save(function(err, created) {
    if(err) return onError(req, res, [{ msg: 'Unknown error' }], 'event/add');
    res.redirect('/events');
  });
};

// DELETE /events
routes.del = function(req, res) {
  var id = req.body._id;
  async.waterfall([

    // find the event
    function(done) { Event.findById(id, done); },

    // and delete it
    function(ev, done) {
      if(!ev) return done('Event not found');
      ev.remove(done);
    }

  ], function(err, removed) {
    res.redirect('/events');
  });
};

// GET /events/:_id/download
routes.download = function(req, res) {
  var id = req.params._id;

  async.auto({

    // retrieve the event object
    ev: function(done) { 
      Event.findOne()
        .where('_id', id)
        .populate('_owner')
        .exec(done);
    },

    // retrieve the media for this event
    media: ['ev', function(done, results) {
      var ev = results.ev;
      var ids = ev.media;

      Media.find()
        .where('id').in(ids)
        .sort('-mediaId')
        .exec(done);
    }],

  }, function(err, results) {
    if(err) return resh.send(res, err);

    var ev = results.ev;
    var media = results.media;
    var urls = _.map(media, function(m) { return m.images.standard_resolution.url; });

    // let client know a zip file is coming down the stream
    res.header("Content-type", "application/octet-stream");
    res.header("Content-Disposition", "attachment; filename=" + ev.name + ".zip");
    res.header("Content-Transfer-Encoding", "binary");

    // setup the zip stream
    var archive = archiver('zip');
    archive.on('error', function(err) { return console.error(err); });
    archive.pipe(res);

    // send file thru zip stream
    var i = 0;
    async.eachSeries(urls, function(url, done) {
      archive.append(request(url), { name: util.format('%s.jpg', i++) }, done);
    }, function(err) {
      if(err) console.error(err);
      archive.finalize(function(err, written) {
        if(err) return console.log(err);
      });
    });
  });
};

// GET /events/:_id/share
routes.share = function(req, res) {
  var eventId = req.params._id;

  // validate event id
  if(!misc.isObjectId(eventId)) return resh.send(res, createError(400, 'invalid event id'));

  // check if the event already has an alias
  // if it doesn't go to the create alias page
  // otherwise go to the edit alias page
  Alias.findOne()
    .where('_event', eventId)
    .exec(function(err, alias) {
      if(err) return resh.send(res, err);

      if(!alias) return res.redirect('/events/' + eventId + '/alias');
      else return res.redirect('/events/' + eventId + '/alias/' + alias._id);
    })
};

/////////////
// Helpers //
/////////////

// helper to create an error object
function createError(code, msg) {
  var error = new Error;
  error.code = code;
  error.message = msg;
  return error;
}

// to get the local path for a picture url
function getLocalFilePath(localdir, url) {
  var parts = url.split('/');
  return path.join(localdir, parts[parts.length - 1]);
}

// to handle form errors
function onError(req, res, errors, view) {
  console.log(errors);
  res.render(view, { event: req.body, errors: errors }); 
}

// export
module.exports = routes;