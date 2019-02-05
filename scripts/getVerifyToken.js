require('dotenv').load();
var mongoose        = require('mongoose');
var database        = process.env.DATABASE || { url: "mongodb://localhost:27017"};
var jwt             = require('jsonwebtoken');
mongoose.connect(database.url);

var User = require('../app/server/models/User');

var email = 'hacker@school.edu';

User.findOne({
  email: email
}, function(err, user){
  console.log(user.generateEmailVerificationToken());
  console.log(user.generateAuthToken());

  var temp = user.generateTempAuthToken();
  console.log(temp);

  console.log(jwt.verify(temp, process.env.JWT_SECRET));
});
