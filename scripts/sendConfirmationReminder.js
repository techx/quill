require('dotenv').load();
var mongoose        = require('mongoose');
var database        = process.env.DATABASE || process.env.MONGODB_URI;
var util = require('util');

mongoose.connect(database);

var User = require('../app/server/models/User');
var UserController = require('../app/server/controllers/UserController');

var user = { email: process.env.ADMIN_EMAIL };

User
    .find({ "verified": true, "status.admitted": true, "status.confirmed": false})
    .exec(function(err, ids) {
        ids.forEach(function(id) {
            UserController.sendConfirmationReminder(id._id, function() {
                console.log(util.format("sent reminder to %s", id.email));
            });
        });
    });