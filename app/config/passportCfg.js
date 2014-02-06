var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var db = require('../models/userDbSchema');

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	db.userModel.findById(id, function (err, user) {
		done(err, user);
	});
});

passport.use(new LocalStrategy(function(username, password, done) {
	db.userModel.findOne({ username: username }, function(err, user) {
		if (err) { return done(err); }
		if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
		user.comparePassword(password, function(err, isMatch) {
			if (err) return done(err);
			if(isMatch) {
				return done(null, user);
			} else {
				return done(null, false, { message: 'Invalid password' });
			}
		});
	});
}));

// Simple route middleware to ensure user is authenticated. Otherwise send to login page.
exports.ensureAuthenticated = function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('#/login')
}

exports.postLogin = function postLogin(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
	if (err) { return next(err) }
	if (!user) {
		return res.send(401)
	}
	req.logIn(user, function(err) {
		if (err) { return next(err); }
		//res.cookie('user', JSON.stringify({'id': user._id}), { httpOnly: false } );
		return res.send(user);
	});
	})(req, res, next);	
}

