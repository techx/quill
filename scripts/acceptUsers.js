require('dotenv').load();
var mongoose        = require('mongoose');
var database        = process.env.DATABASE || "mongodb://develop:HackUCI2018@cluster0-shard-00-00-j5esm.mongodb.net:27017,cluster0-shard-00-01-j5esm.mongodb.net:27017,cluster0-shard-00-02-j5esm.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin";
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
  UserController.sendAcceptanceEmailById( id, function() {
    count += 1;
    if (count == userArray.length) {
      console.log("Done");
    }
  });
});
