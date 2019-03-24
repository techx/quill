require('dotenv').load();
var mongoose        = require('mongoose');
var database        = process.env.PROD_DATABASE || "mongodb://localhost:27017";
var jwt             = require('jsonwebtoken');
mongoose.connect(database);

var User = require('../app/server/models/User');
var Settings = require('../app/server/models/Settings');
var UserController = require('../app/server/controllers/UserController');

var user = { email: process.env.ADMIN_EMAIL };

var os = require('os');
var userArray = require('fs').readFileSync('scripts/data/acceptances.csv').toString().split('\n');
var count = 0;
console.log(userArray);
userArray.forEach(function (email) {
    UserController.admitUserByEmail(email, user, function(err) {
      if(err){
        console.log(err);
      }
      console.log('admitted:' + email);
      count += 1;
      if (count === userArray.length) {
        console.log("Done");
      }
    });
});
