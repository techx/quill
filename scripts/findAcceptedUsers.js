require('dotenv').load();
var mongoose        = require('mongoose');
var database        = process.env.DATABASE || "mongodb://localhost:27017";
mongoose.connect(database);

var User = require('../app/server/models/User');
// var UserController = require('../app/server/controllers/UserController');

User
    .find({"verified": true, "status.completedProfile": true, "status.admitted": false, "timestamp": {$gte: 1603400400}})
    .exec(function(err, ids) {
        ids.forEach(function(id) {
            // var fields = [id.profile.firstName, id.profile.lastName, id.email]
            console.log(id.email)
        });
});
