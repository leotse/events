////////////////////
// Configurations //
////////////////////

// configurations for the different environments
var config = {};

// environments
var env = process.env.NODE_ENV || 'development';
if(env === 'production') {

	// prod environment
	config.db = null;
	config.session = {
		secret: null,
		db: null
	};
	config.instagram = {
		key: null,
		secret: null,
		callback: null
	};

} else { 

	// dev environment
	config.db = 'mongodb://localhost/ievents';
	config.session = {
		secret: '678a3bcd590e40458b617518c70d4799',
		db: 'mongodb://localhost/ievents'
	};
	config.instagram = {
		key: 'de7ec4f7c3094d58868781fa776a7051',
		secret: 'd56cf05ae65e4feab05e08bfacab5194',
		callback: 'http://localhost:3000/auth/instagram/callback'
	};
	
}

// export
module.exports = config;