// Connect to mongodb
var mongoose        = require('mongoose');
var database        = process.env.DATABASE || { url: "mongodb://localhost:27017"};
mongoose.connect(database.url);

var UserController = require('../app/server/controllers/UserController');

var users = 1000;
var username = 'fucker';

for (var i = 0; i < users; i++){
  console.log(username, i);
  UserController
    .createUser(username + i + '@balls.edu', 'foobar', function(){
    console.log(i);
    });
}