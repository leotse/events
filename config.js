////////////////////
// Configurations //
////////////////////

// configurations for the different environments
var config = {};

// environments
var env = process.env.NODE_ENV || 'development';
if(env === 'production') {

	// prod environment
	config.db = 
	config.instagram = {
		key: null,
		secret: null,
		callback: null
	};

} else { 

	// dev environment
	config.instagram = {
		key: 'de7ec4f7c3094d58868781fa776a7051',
		secret: 'd56cf05ae65e4feab05e08bfacab5194',
		callback: 'http://localhost:3000/instargram/callback'
	};

}

// export
module.exports = config;