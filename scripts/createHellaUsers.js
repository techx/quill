// Connect to mongodb
var mongoose        = require('mongoose');
var database        = process.env.DATABASE || { url: "mongodb://localhost:27017"};
mongoose.connect(database.url);

var UserController = require('../app/server/controllers/UserController');

var users = 10;
var username = 'hacker';

for (var i = 0; i < users; i++){
  console.log(username, i);
  // Creates, Verifies, Submits
  UserController
    .createUser(username + i + '@school.edu', 'foobar', function(err, user) {
      console.log(user);
    });
}
