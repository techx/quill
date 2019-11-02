require('dotenv').load();
var mongoose        = require('mongoose');
var database        = process.env.DATABASE || "mongodb://localhost:27017";
var jwt             = require('jsonwebtoken');
mongoose.connect(database);

var User = require('../app/server/models/User');
var UserController = require('../app/server/controllers/UserController');

var user = { email: process.env.ADMIN_EMAIL };

var userArray = User.aggregate([
    { 
        $group: { 
            _id: '$teamCode', 
            num: { $sum: 1 }, 
            admitted: { 
                $sum: {
                    $cond: [ 
                        { $eq: [ "$status.admitted", true ] },
                        1,
                        0
                    ]
                }
            }
        },
    },
    {
        $project: {
            "accept_ratio": {
                $cond: [
                    { $eq: [ "$admitted", 0 ] },
                    0,
                    { $divide: [ "$admitted", "$num" ] }
                ]
            },
            "admitted": "$admitted",
            "num": "$num"
        }
    }
])
.sort('_id')
.exec(function(err, ids) {
    ids.forEach(function(team) {
        console.log(team);
        if (team.accept_ratio >= 0.5 && team._id !== null) {
            User.find(
                { teamCode: team._id }, 
                "_id status"
            )
            .exec(function(err, users) {
                users.forEach(function (u) {
                    if (u.status.admitted === false) {
                        UserController.admitUser( u._id, user, function() {
                        });
                    }
                });
            })
        }
    });
});
/*var count = 0;
userArray.forEach(function (id) {
  UserController.admitUser( id, user, function() {
    count += 1;
    if (count == userArray.length) {
      console.log("Done");
    }
  });
});*/
