var Updates = require('../models/Updates');

var UpdatesController = {};

/**
 * Get all messages from specific index.
 * @param {Integer} length
 * @param {Function} callback
 */
UpdatesController.getUpdates = function(length, callback){
    Updates
        .findOne({})
        .exec(function(err, updates){
            if (err || !updates || updates.messages.length === length){
                return callback(err);
            }

            updates.messages = updates.messages.slice(length);
            return callback(err, updates);
        });
};

/**
 * Update messages.
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
UpdatesController.update = function(message, callback) {
    Updates
        .findOneAndUpdate({}, {
        $push: {messages: message},
    }, {
        new: true,
    }, callback);
};

module.exports = UpdatesController;