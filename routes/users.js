var express = require('express');
var multer = require('multer');
var passport = require('passport');

var router = express.Router();
var upload = multer({
	dest: 'uploads/'
});
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('respond with a resource');
});

/* GET register page */
router.get('/register', function(req, res, next) {
	res.render('register', {
		'title': 'Register'
	});
});

/* GET Login page */
router.get('/login', function(req, res, next) {
	res.render('login', {
		'title': 'Login'
	});
});

/* POST register form data */
router.post('/register', upload.single('profileimage'), function(req, res, next) {
	// Get the form values
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Check for image field
	if (req.file) {
		console.log('Uploading file ...');

		// File info
		var profileImageOriginalName = req.files.profileimage.originalname;
		var profileImageName = req.files.profileimage.name;
		var profileImageMime = req.files.profileimage.mimetype;
		var profileImagePath = req.files.profileimage.path;
		var profileImageExt = req.files.profileimage.extension;
		var profileImageSize = req.files.profileimage.size;
	} else {
		// Set a default image
		var profileImageName = 'noimage.png';
	}

	//Form validation
	req.checkBody('name', 'Name field is required').notEmpty();
	req.checkBody('email', 'Email field is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username field is required').notEmpty();
	req.checkBody('password', 'Password field is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(password);

	// Check for errors
	var errors = req.validationErrors();

	if (errors) {
		res.render('register', {
			errors: errors,
			name: name,
			email: email,
			username: username,
		});
	} else {
		var newUser = new User({
			name: name,
			email: email,
			username: username,
			password: password,
			profileimage: profileImageName
		});

		// Create user
		User.createUser(newUser, function(error, user) {
			if (error) throw error;
			console.log(user);
		});

		// Success message
		req.flash('success', 'You are now registered and may login');

		res.location('/');
		res.redirect('/');
	}
});

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.getUserById(id, function(err, user) {
		done(err, user);
	});
});

passport.use(new LocalStrategy(
	function(username, password, done) {
		User.getUserByUsername(username, function(error, user) {
			if (error) {
				throw error;
			}

			if (!user) {
				console.log('Unknown user');
				return done(null, false, {
					message: 'Unknown user'
				});
			}

			User.comparePassword(password, user.password, function(error, isMatch) {
				if (error) throw error;

				if (isMatch) {
					done(null, user);
				} else {
					console.log('Invalid password');
					return done(null, false, {
						message: 'Invalid password'
					});
				}
			});
		});
	}
));

/* POST login data */
router.post('/login',
	passport.authenticate('local', {
		failureFlash: 'Invalid username or password',
		failureRedirect: '/users/login'
	}),
	function(req, res) {
		console.log('Authentication successfull');
		req.flash('success', 'You are logged in');
		res.redirect('/');
	}
);

/* GET logout */
router.get('/logout', function(req, res) {
	req.logout();
	req.flash('success', 'You have logged out');
	res.redirect('/users/login');
});


module.exports = router;
