var express = require('express');
var expressValidator = require('express-validator');

var USER = require('../routes/users');

// var Date = require('date.js');

// User model
var User = require('../models/user');

// Item model
var Item = require('../models/item');

var router = express.Router();

/* GET users listing. */


router.get('/addlist', ensureAuthenticated, function(req, res, next) {
    res.render('addlist', {
        'title': 'Todo lists'
    });
});

function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        console.log(req.isAuthenticated());
        console.log(req.user);
        return next();
    } else {
        res.redirect('/users/login');
    }
}

router.post('/addlist', function(req, res, next) {
    var desc = req.body.desc;
    var location = req.body.location;
    var time = Date.parse(req.body.time)/1000;

    console.log("Inside post /addlist: " + req.user);
    console.log("Inside post /addlist: " + req.user._id);

    // Create item
    var newItem = new Item({
        desc: desc,
        location: location,
        time: time
    });

    Item.createItem(newItem, function(err, item) {
        if (err) throw err;
        console.log(item.id);

        User.addItemToUser(req.user._id, item.id, function(err, returnCode) {
            if (err) throw err;
            console.log(returnCode);
        });
    });


    res.render('addlist', {
        'title': 'Todo lists'
    })
});



module.exports = router;
