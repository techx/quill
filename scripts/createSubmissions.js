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
    .createUser(username + i + '@school.edu', 'foobar', function(err, res){
      console.log(i);
      if(err){
        console.log(err);
        return;
      }
      console.log(res.token);

      UserController.verifyByToken(res.token, function(err, user){
        if(err){
          console.log(err);
          return;
        }
        // submit user should
        var profile = {
          firstName: username,
          lastName: i,
          gender: "Male",

          ethnicity: 'White / Caucasian',

          school: "School",

          year: '2020',

          major: 'Computer Science',

          experience: 'Beginner',

          resume: {
            name: 'test',
            id: '1',
            link: 'https://google.com'
          },

          essay1: 'Test essay 1',

          essay2: 'Test essay 2',

          essay3: 'Test essay 3',

          skills: 'Hacking',

          linkedin: 'linkedin',
          github: 'github',
          other: 'other',

          role: {
            developer: true,
            designer: false,
            productManager: false,
            other: ''
          },

          transportation: true,

          adult: true,

          mlh: true

        };
        UserController.submitById(user.id, profile, function(err, user){
          // done
        });
    });



    });
}
