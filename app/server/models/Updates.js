var mongoose = require('mongoose');

/**
 *  Basic message info for update message.
 *
 * @type {{date: DateConstructor, message: StringConstructor, user: StringConstructor}}
 */
var message = {
    message: String,
    date: Date,
    user: String,
};

/**
 * Update Schema!
 *
 * @type {mongoose}
 */
var schema = new mongoose.Schema({
    messages:{
        type: [message],
        default: []
    },
});

module.exports = mongoose.model('Updates', schema);
