var Updates = require('../models/Updates');

var UpdatesController = {};

/**
 * Get all messages.
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
UpdatesController.getUpdates = function(callback){
    Updates
        .findOne({})
        .exec(callback);
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