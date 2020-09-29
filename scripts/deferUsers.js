require('dotenv').load();
var mongoose        = require('mongoose');
var database        = process.env.DATABASE || process.env.MONGODB_URI;;
var jwt             = require('jsonwebtoken');
mongoose.connect(database);

var UserController = require('../app/server/controllers/UserController');

var user = { email: process.env.ADMIN_EMAIL };

var userArray = require('fs').readFileSync('deferred.txt').toString().split('\n');
var count = 0;
userArray.forEach(function (id) {
    UserController.deferUser(id, user, function() {
        count += 1;
        if (count == userArray.length) {
          console.log("Done");
        }
      });
});