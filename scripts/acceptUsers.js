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

(function userArrayLoop(i) {
  // process two users a second as to not overload the sending api
  setTimeout(function() {
    if (i--) {
      userArrayLoop(i);
      var email = userArray[i];
      UserController.admitUserByEmail(email, user, function() {
        UserController.sendAcceptanceEmailByEmail(email, function() {
          console.log('[' + i + '] processed: ' + email)
          if (i === 0) {
            console.log("Done in one second");
            setTimeout(() => process.exit(0), 1000);
          }
        });
      });
    }
  }, 500);
})(userArray.length);