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
var Event = require('../models/event');
var Media = require('../models/medium');

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
  async.auto({

    // first get the event object
    event: function(done) { Event.findById(req.params._id, done); },

    // then get the media associated to this event
    media: [ 'event', function(done, results) {
      var event = results.event;

      // make sure event is found
      if(!event) return done(new Error('event not found'));

      // and get all the media for this event
      Media.find()
        .where('id').in(event.media)
        .sort({ $natural: -1 })
        .exec(done);
    }]

  }, function(err, results) {
    if(err) return resh.send(res, err);

    // finally render the page!
    var event = results.event;
    var media = results.media;
    res.render('event/get', { event: event, media: media });
  });
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
        .sort('-created_time')
        .exec(done);
    }],

    // // create the local dir to store downloaded pics
    // localdir: [ 'ev', 'media', function(done, results) {
    //   var ev = results.ev;
    //   var user = ev._owner;
    //   var localdir = path.join(__dirname, util.format('../download/%s/%s', user.id, ev._id));

    //   // create the local download dir
    //   fs.mkdir(localdir, 0777, true, function(err) { done(err, localdir); });
    // }],

    // // download pics!
    // download: [ 'media', 'localdir', function(done, results) {
    //   var media = results.media;
    //   var dir = results.localdir;
    //   var urls = _.map(media, function(m) { return m.images.standard_resolution.url; });

    //   async.map(urls, function(url, urlDone) {
    //     var file = getLocalFilePath(dir, url);
    //     var fileStream = fs.createWriteStream(file);
    //     var httpStream = request(url);

    //     httpStream.on('error', function(err) { console.error(err); urlDone(); });
    //     httpStream.on('end', function() { urlDone(null, file); });
    //     httpStream.pipe(fileStream);

    //   }, done);
    // }],

    // // zip up the pics
    // zip: [ 'ev', 'download', function(done, results) {
    //   var files = results.download;
    //   var ev = results.ev;
    // }]

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

/////////////
// Helpers //
/////////////

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