var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
mongoose.connect('mongodb://localhost:27017/nodeauth');

var db = mongoose.connection;

// User schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index: true
	},
	password: {
		type: String,
		required: true,
		bcrypt: true
	},
	email: {
		type: String
	},
	name: {
		type: String
	},
	profileimage: {
		type: String
	}
});

var User = module.exports = mongoose.model('User', UserSchema);

// Functions User model will handle
module.exports.createUser = function(newUser, callback) {
	// Hash the password to not store it in plaintext
	bcrypt.hash(newUser.password, 10, function(error, hash) {
		if (error) throw error;

		// Set hashed password
		newUser.password = hash;

		newUser.save(callback);
	});
}

module.exports.getUserByUsername = function(username, callback) {
	var query = {
		username: username
	};

	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback) {
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
	bcrypt.compare(candidatePassword, hash, function(error, isMatch) {
		if (error) {
			console.log(error);
			return callback(error);
		}

		callback(null, isMatch);
	});
}
