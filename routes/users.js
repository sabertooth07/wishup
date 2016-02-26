var express = require('express');
var expressValidator = require('express-validator');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

// load the auth variables
var configAuth = require('../config/auth');

// User model
var User = require('../models/user');

var router = express.Router();
GLOBAL.USER = 'hi';

router.get('/register', function(req, res, next) {
    res.render('register', {
        'title': 'Register'
    })
});

router.post('/register', function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var confirmPassword = req.body.confirmPassword;

    req.checkBody('username', 'Email is required').notEmpty();
    req.checkBody('username', 'eg. abc@def.com').isEmail();
    req.checkBody('password', 'Password field is required').notEmpty();
    req.checkBody('confirmPassword', 'Passwords do not match').equals(password);
    
    var errors = req.validationErrors();

    if (errors) {
        console.log(errors);
        res.render('register', {
            'title': 'Register',
            'errors': errors,
            'username': username,
            'password': password,
            'confirmPassword': confirmPassword
        })
    } else {
        // Create user
        var newUser = new User({
            'username': username,
            'password': password
        });

        User.createUser(newUser, function(err, user){
            if (err) throw err;
            // console.log(user);
        });

        res.render('login', {
            'title': 'login'
        })
    }
});

router.get('/login', function(req, res, next) {
    res.render('login', {
        'title': 'Login'
    })
});

passport.serializeUser(function(user, done) {
    GLOBAL.USER = user;
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    GLOBAL.USER = null;
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

// Local strategy
passport.use(new LocalStrategy(
    function(username, password, done){
        console.log('hi');
        User.fetchUserByUsername(username, function(err, user){
            // console.log(user);
            if (err) throw err;
            if(!user) {
                console.log('unknwn user');
                return done(null, false, {message: 'Unknown User'});
            } else {
                console.log('known user');
                User.checkPassword(password, user.password, function(err, isMatch) {
                    if (err) throw err;
                    if(isMatch) {
                        console.log('knwn user');
                        return done(null, user);
                    } else {
                        console.log('unknwn user');
                        return done(null, false, {message: 'Unknown User'});
                    }
                });
            }
    });
}));

router.post('/login', 
    passport.authenticate('local', { failureRedirect: '/users/login', 
        failureFlash:'Invalid username or Password' }), function(req, res) {
            console.log("Authentication succeded");
            req.flash('success', 'You are logged in');
            // console.log(user);
            res.redirect('/lists/addlist');
    }
);

// facebook strategy
passport.use(new FacebookStrategy({
        clientID: configAuth.facebookAuth.FACEBOOK_APP_ID,
        clientSecret: configAuth.facebookAuth.FACEBOOK_APP_SECRET,
        callbackURL: "http://localhost:3000/users/facebook/callback",
        profileFields: ['id', 'name', 'emails']
    },
    function(accessToken, refreshToken, profile, done) {
        // console.log(profile);
        User.findFbUser(profile, function (err, user) {
            // console.log(user);
            if (err) throw err;
            if(!user) {
                console.log('unknwn user');
                var newUser = new User();
                newUser.facebook.id = profile.id;

                User.addFbUser(newUser, function(err, user) {
                    if (err) throw err;
                    // console.log(user);
                    return done(null, user);
                });
                // return done(null, false, {message: 'Unknown User'});
            } else {
                console.log('known user');
                return done(null, user);
            }
        });
    }
));

router.get('/facebook', passport.authenticate('facebook'));

router.get('/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/lists/addlist', failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log("before redirect:");
    console.log(user);
    res.redirect('/lists/addlist');
  });



router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success', 'You have logged out');
    res.redirect('/users/login');
});

//module.exports = USER;
module.exports = router;
