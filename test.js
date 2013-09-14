var request = require('request');
var url = 'https://api.instagram.com/v1/tags/superstreet/media/recent?access_token=6243303.de7ec4f.55ae826ded9d456da186fdbb56f1ee4e'
var agent = { maxSockets: 1000 };

var i;
for(i = 0; i < 5000; i++) {
	makeRequest(i);
}

function makeRequest(i) {
	request({ url: url, strictSSL: true, pool: agent }, function(e, r, b) {
		if(e) throw e;
		console.log(i);
	});
}