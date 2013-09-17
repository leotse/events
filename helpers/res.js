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

  // send error to client
  var code = err.code || 500;
  var msg = err.message || 'unknown error';
  res.send(code, { code: code, msg: msg });
};

// export
module.exports = helpers;