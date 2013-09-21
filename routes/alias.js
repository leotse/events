//////////////////
// Alias Routes //
//////////////////
var routes = {};

// libs
var _ = require('underscore');
var async = require('async');
var resh = require('../helpers/res');
var misc = require('../helpers/misc');
var Event = require('../models/event');
var Alias = require('../models/alias');

// GET /events/:id/alias
routes.addView = function(req, res) {
  var eventId = req.params._id;

  // verify object id format
  if(!misc.isObjectId(eventId)) return resh.send(res, createError(400, 'invalid event id'));

  // retrieve the event object
  Event.findById(eventId, function(err, ev) {
    if(err) return resh.send(res, err);
    else if(!ev) return resh.send(res, createError(404, 'event not found'));

    // and render the create alias page
    res.render('alias/add', { event: ev });
  });
};

// PUT /events/:id/alias
routes.add = function(req, res) {
  var eventId = req.params._id
  var alias = req.body.alias;

  // validate event id
  if(!misc.isObjectId(eventId)) return resh.send(res, createError(400, 'invalid event id'));

  // validate form
  req.assert('alias', 'alias must not be empty').notEmpty();
  var errors = req.validationErrors();
  if(errors) return resh.send(res, createError(400, 'invalid alias'));

  async.waterfall([

    // check if the alias already exist
    function(done) { Alias.findOne().where('alias', alias).exec(done); },

    // create alias if it doesn't exist
    // but first we have to get the event
    function(alias, done) {
      if(alias) return done(createError(400, 'alias has already been taken'));
      Event.findById(eventId, done);
    },

    // create alias for this event
    function(ev, done) {
      if(!ev) return createError(404, 'event not found');
      var al = new Alias;
      al._event = ev;
      al.alias = alias;
      al.save(done);
    }

  ], function(err, results) {
    if(err) return resh.send(res, err);
    res.redirect('/events');
  });
};


// GET /events/:eid/alias/:aid
routes.editView = function(req, res) {
  var aid = req.params.aid;
  var eid = req.params.eid;

  // make sure the ids are valid
  if(!misc.isObjectId(eid)) return resh.send(res, createError(400, 'invalid event id'));
  if(!misc.isObjectId(aid)) return resh.send(res, createError(400, 'invalid alias id'));

  // retrieve the alias id
  Alias.findOne()
    .where('_id', aid)
    .populate('_event')
    .exec(function(err, alias) {
      if(err) resh.send(res, err);
      if(!alias) return resh.send(res, createError(404, 'alias not found'));
      res.render('alias/edit', { event: alias._event, alias: alias });
    });
};

// POST /events/:eid/alias/:aid
routes.edit = function(req, res) {
  var aid = req.params.aid;
  var eid = req.params.eid;

  // make sure the ids are valid
  if(!misc.isObjectId(eid)) return resh.send(res, createError(400, 'invalid alias id'));
  if(!misc.isObjectId(aid)) return resh.send(res, createError(400, 'invalid alias id'));

  // form validation
  var aliasName = req.body.alias;
  req.assert('alias', 'alias must not be empty').notEmpty();
  var errors = req.validationErrors();
  if(errors) return resh.send(res, createError(400, 'invalid alias'));

  async.waterfall([

    // retrieve the alias
    function(done) {
      Alias.findOne()
        .where('_id', aid)
        .populate('_event')
        .exec(done);
    },

    // update the alias!
    function(alias, done) {
      if(!alias) return done(createError(404, 'alias not found'));
      if(eid !== alias._event._id.toString()) return done(createError(400, 'alias does not belong to this event'));

      alias.alias = aliasName;
      alias.save(done);
    }

  ], function(err, result) {
    if(err) resh.send(res, err);
    res.redirect('/events');
  });

};


/////////////
// Helpers //
/////////////

// helper to create an error
function createError(code, msg) {
  var error = new Error(msg);
  error.code = code;
  return error;
}


// export
module.exports = routes;