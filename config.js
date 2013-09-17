////////////////////
// Configurations //
////////////////////

// configurations for the different environments
var config = {};

// environments
var env = process.env.NODE_ENV || 'development';
if(env === 'production') {

	// prod environment
	config.db = process.env.MONGOHQ_URL;
	config.session = {
		secret: 'fc0b736fc87b432bb928c08db18aaa01',
		db: process.env.MONGOHQ_URL
	};
	config.instagram = {
		key: 'ea0ac3c3467542c18deafdf2d7e38669',
		secret: 'cda054b8dc784d2091f18c7e03d9c199',
		callback: 'http://www.capsulati.com/auth/instagram/callback'
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