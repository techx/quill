var Updates = require("../app/server/models/Updates");

// Add new updates object if doesnt exist
Updates
    .findOne({})
    .exec(function (err, updates){
        if(!updates){
            var f = new Updates();
            f.save(function(err){
                if(err){
                    console.log(err);
                }
            });
        }
    });