//////////////////
// Event Routes //
//////////////////
var routes = {};

// libs
var async = require('async');
var resh = require('../helpers/res');
var Event = require('../models/event');

// GET /events
routes.list = function(req, res) {
  var user = req.user;

  // get user's events
  Event.find()
    .where('_owner', user._id)
    .sort({ $natural: 1 })
    .exec(function(err, events) {
      res.render('event/list', { events: events });
    });
};

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

/////////////
// Helpers //
/////////////

// to handle form errors
function onError(req, res, errors, view) {
  console.log(errors);
  res.render(view, { event: req.body, errors: errors }); 
}

// export
module.exports = routes;