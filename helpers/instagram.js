///////////////////////
// Instagram Helpers //
///////////////////////

// wrapper to call instagram api
var insta = {};

// libs
var util = require('util');
var request = require('request');
var config = require('../config');

// endpoints
var BASE = 'https://api.instagram.com/v1';
var TAG = BASE + '/tags/%s/media/recent?hello=world';

// get latest media by tag
insta.tag = function(tag, callback) {
  var url = getUrl(TAG, tag);
  request({ url: url, json: true }, function(e, r, b) {
    if(e) return onError(e, callback);
    if(r.statusCode !== 200) return onAPIError(r.statusCode, body, callback);
    callback(null, new InstaMedia(b));
  });
};

/////////////
// Classes //
/////////////

// wrapper class for the instagram response, mainly to handle pagination
function InstaMedia(json) {
  if(!json) throw new Error('api respones json required to instantiate InstaResponse');

  // media getter
  this.data = function() { return json.data; }

  // pagination getter
  this.pagination = function() { return json.pagination; }

  // returns the raw json response
  this.toJSON = function() { return json; };
}


/////////////
// Helpers //
/////////////

// to generate the instagram api url
function getUrl(endpoint, params) {

  // base url
  var url = util.format(endpoint, params);

  // add api key
  url += (url.indexOf('?') < 0 ? '?' : '&');
  url += 'client_id=' + config.instagram.key;
  return url;
}

// helper to handle request error
function onError(err, callback) {
  console.error('api request error: ' + JSON.stringify(err));

  var error = new Error;
  error.code = 500;
  error.message = 'request error';
  callback(error);
}

// helper to handle api error
function onAPIError(code, body, callback) {
  console.error('api returned error: %s', body);

  var error = new Error;
  error.code = code
  error.message = 'api error';
  callback(error);
}

module.exports = insta;