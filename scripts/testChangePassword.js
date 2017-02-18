require('dotenv').load();
var mongoose        = require('mongoose');
var database        = process.env.DATABASE || { url: "mongodb://localhost:27017"};
var jwt             = require('jsonwebtoken');
mongoose.connect(database.url);

var User = require('../app/server/models/User');
var UserController = require('../app/server/controllers/UserController');

var email = 'hacker@school.edu';

User.findOne({
  email: email
}, function(err, user){
  var id = user._id;

  /* Change with old password */ 
  UserController.changePassword(
    id,
    'foobar',
    'hunter123',
    function (err, something){
      console.log(!err ? 'Successfuly changed' : err);
    }
  );

  /* Change with auth token */
  // var token = user.generateTempAuthToken();

  // UserController.resetPassword(
  //   id,
  //   token,
  //   'hunter123',
  //   function (err, something){
  //     console.log(!err ? 'Successfully changed' : err);
  //   }
  // );

});
