require('dotenv').load();
var mongoose        = require('mongoose');
var database        = process.env.DATABASE || "";
var jwt             = require('jsonwebtoken');
mongoose.connect(database);

var UserController = require('../app/server/controllers/UserController');

var user = { email: process.env.ADMIN_EMAIL };
/**
 * Send the acceptance email and updates participant profile.
 */
var userArray = require('fs').readFileSync('accepted.txt').toString().split('\n');
var count = 0;
userArray.forEach(function (id) {
  UserController.admitUser(id, user, function() {
    count += 1;
    if (count == userArray.length) {
      console.log("Done");
      process.exit(0);
    }
  });
});

userArray.forEach(function (id) {
  UserController.sendAcceptanceEmailById(id, function() {
    count += 1;
    if (count == userArray.length) {
      console.log("Done");
      process.exit(0);
    }
  });
});
