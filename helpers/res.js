//////////////////////
// Response Helpers //
//////////////////////

// helpers to handle response to client
var helpers = {};

helpers.send = function(res, err, data) {
  if(err) return helpers.error(res, err);
  res.send(data);
};

helpers.error = function(res, err) {

  // log the error
  console.error(err);

  // not really sure what this error is...
  res.send(500, { code: 500, msg: 'unknown error' });
};

// export
module.exports = helpers;