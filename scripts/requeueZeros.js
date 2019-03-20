require('dotenv').config();
// Connect to mongodb
var mongoose = require('mongoose');
var database        = process.env.DATABASE || "mongodb://localhost:27017";
mongoose.connect(database, {useNewUrlParser: true});

var User = require('../app/server/models/User');
var Settings = require('../app/server/models/Settings');
var ADMIN_EMAIL = process.env.ADMIN_EMAIL;

User.find({
    verified: true,
    admin: false,
    'status.submitted': true
}, function (err, users) {
    var zeroList = {};
    // filter out all the triple 0 reviews
    users.forEach(user => {
        user.review.reviewers.forEach(review => {
            if(review.ratings.length === 0){
                // ratings do not exist
                return;
            }

            var ratingSum = review.ratings.reduce((sum, rating) => sum + rating, 0);
            // add to list
            if (ratingSum === 0) {
                // push back into list
                User.findOneAndUpdate({
                    admin: true,
                    email: review.email,
                },{
                    $push: {
                        'review.reviewQueue': user.id,
                    }
                }, function(err, adminUser){
                    if(err){
                        console.log(err);
                    }
                });

                // just to print
                if (zeroList[review.email] === undefined) {
                    zeroList[review.email] = [user.email];
                } else {
                    zeroList[review.email].push(user.email);
                }
            }
        });
    });

    console.log(zeroList)
});

