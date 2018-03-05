controller = {};

/**
 * Generate a QR code payload compatible with Cumin that contains:
 * user's id and email
 * @param   {[user]}    user       [user object]
 */
controller.generateCheckInPayload = function (user) {
    var payload = {
        "userId": user._id,
        "email": user.email
    };
    return JSON.stringify(payload);
};


/**
 * Get user details from QR code payload
 * @param   {[string]}    payload       [string payload]
 * @return Object with userId and email for a user
 */
controller.getUserDataFromPayload = function (payload) {
  return JSON.parse(payload);
}

module.exports = controller;
