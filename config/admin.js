ADMIN_EMAIL = process.env.ADMIN_EMAIL;
ADMIN_PASSWORD = process.env.ADMIN_PASS;

// Create a default admin user.
var User = require('../app/server/models/User');
// Create general chat
var Forum = require('../app/server/models/ForumData');
var general = "general";

// If there is already a user
User
  .findOne({
    email: ADMIN_EMAIL
  })
  .exec(function(err, user){
    if (!user){
      var u = new User();
      u.email = ADMIN_EMAIL;
      u.password = User.generateHash(ADMIN_PASSWORD);
      u.admin = true;
      u.verified = true;
      u.save(function(err){
        if (err){
          console.log(err);
        }
      });
    }
  });

// Add General chat if doesnt exist
Forum
    .findOne({
      forumType : general
    })
    .exec(function (err, forum){
      if(!forum){
        var f = new Forum();
        f.forumType = general;
        f.team = "generalHackChat";
        f.save(function(err){
          if(err){
            console.log(err);
          }
        });
      }
    });