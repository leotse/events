///////////////////////
// Instagram Helpers //
///////////////////////

// wrapper to call instagram api
var insta = {};

// libs
var _ = require('underscore');
var util = require('util');
var request = require('request');
var config = require('../config');

// endpoints
var BASE = 'https://api.instagram.com/v1';
var TAG = BASE + '/tags/%s/media/recent';


/////////////
// Classes //
/////////////

insta.TagClient = function(tag) {
  var self = this;

  // instagram api url
  this.url = getUrl(TAG, tag);

  // fetches the next page of data from instagram api
  this.fetch = function(callback) {
    request({ url: self.url, json: true }, function(e, r, b) {
      if(e) return onError(e, callback);
      if(r.statusCode !== 200) return onAPIError(r.statusCode, body, callback);

      // update fetch url to handle paging
      var media = new InstaMedia(tag, b);
      self.url = media.nextUrl();
      callback(null, media);
    });
  }

}

// wrapper class for the instagram response, mainly to handle pagination
function InstaMedia(tag, json) {
  if(!json) throw new Error('api response json required to instantiate InstaMedia object');
  var self = this;

  // wrap each media object
  this.data = _.map(json.data, function(datum) { return new InstaMedium(tag, datum); });

  // next url getter
  this.nextUrl = function() { return json.pagination.next_url; };

  // end date getter
  this.endDate = function() { return self.data[0].getTagDate(); };

  // start date getter
  this.startDate = function() { return self.data[self.data.length - 1].getTagDate(); };

  // returns the raw json response
  this.toJSON = function() { return json; };
}

function InstaMedium(tag, data) {
  if(!data) throw new Error('InstaMedia json required to instantiate InstaMedium object');
  var self = this;

  // data getter
  this.data = data;

  // gets the tagged date for this medium
  this.getTagDate = function() {
    var tagtime = data.caption ? data.caption.created_time : data.created_time;
    var comments = data.comments.data;

    // iterate the comments and find the latest tag time
    var comment, i = comments.length - 1, hashtag = '#' + tag.toLowerCase();
    for(i; i >= 0; i--) {
      comment = comments[i];
      if(comment.text.toLowerCase().indexOf(hashtag) >= 0) {
        tagtime = Math.max(tagtime, comment.created_time);
        break;
      }
    }
    return new Date(tagtime * 1000);
  }
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