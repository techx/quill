var Forum = require('../app/server/models/ForumData');
var general = "general";

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
