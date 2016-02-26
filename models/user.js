var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost/wishupUsers');
var db = mongoose.connection;

//User schema
var UserSchema = mongoose.Schema({
    "username": {
        type:String,
        index: true
    },
    "facebook.id": {
        type:String,
        index: true
    },
    "password": {
        type: String, 
        bcrypt: true
    },
    "items": {
        type: [ String ]
    }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback) {
    console.log(newUser.password);
    bcrypt.hash(newUser.password, 8, function(err, hash) {
        console.log(hash);
        if (err) throw err;
        newUser.password = hash;
        newUser.save(callback);
    });
}

module.exports.fetchUserByUsername = function(username, callback) {
    console.log(username);
    var query = {"username": username};
    User.findOne(query, callback);
}

// Facebook login && register
module.exports.findFbUser = function(profile, callback) {
    console.log(profile);
    var query = {"facebook.id": profile.id};
    User.findOne(query, callback);
}

module.exports.addFbUser = function(newUser, callback) {
    // var newUser = {"facebook.id": profile.id};
    console.log(newUser);
    newUser.save(callback);
}

module.exports.getById = function(id, callback) {
    User.findById(id, callback);
}

module.exports.checkPassword = function(password, passwordInput, callback) {
    console.log(password);
    bcrypt.compare(password, passwordInput, function(err, isMatch) {
        if(err) return callback(err);
        callback(null, isMatch)
    });
}

module.exports.addItemToUser = function(userId, itemId, callback) {
    console.log("Model User user id: " + userId);
    console.log("Model User item id: " + itemId);
    User.update({_id: userId}, {$push: { items: itemId } }, callback);
}

//module.exports = db;
