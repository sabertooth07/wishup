var mongoose = require('mongoose');

mongoose.createConnection('mongodb://localhost/wishupUsers');
var db = mongoose.connection;

// Item schema
var ItemSchema = mongoose.Schema({
    "desc": {type: String},
    "location": {type: String},
    "time": {type: Number}
});

var Item = module.exports = mongoose.model('Item', ItemSchema);

module.exports.createItem = function(newItem, callback) {
    return(newItem.save(callback)._id);
}

