require('dotenv').load();
var mongoose        = require('mongoose');
var database        = process.env.DATABASE;
mongoose.connect(database);

var User = require('../app/server/models/User');
var UserController = require('../app/server/controllers/UserController');

var user = { email: process.env.ADMIN_EMAIL };

User
    .find({ "status.completedProfile": false})
    .exec(function(err, ids) {
        ids.forEach(function(id) {
            UserController.sendApplicationReminder(id.email, user, function() {});
        });
    });