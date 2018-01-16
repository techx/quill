import { setTimeout } from 'timers';

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
userArray.forEach(function (email) {
  UserController.admitUserByEmail(email, user, function() {
    // send one email a second as to not overload the sending api
    setTimeout(() => {
      console.log(email)
      UserController.sendAcceptanceEmailByEmail(email, function() {
        count += 1;
        if (count == userArray.length) {
          console.log("Done in one second");
          setTimeout(() => process.exit(0), 1000);
        }
      });
    }, 500)
  });
});
