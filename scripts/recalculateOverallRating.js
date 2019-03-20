require('dotenv').config();
// Connect to mongodb
var mongoose = require('mongoose');
var database        = process.env.DATABASE || "mongodb://localhost:27017";
mongoose.connect(database, {useNewUrlParser: true});

var User = require('../app/server/models/User');

User.find({
    verified: true,
    admin: false,
    'status.submitted': true,
}, function (err, users) {
    users.forEach(user => {
        var overallRating = user.review.reviewers.reduce((sum1, review) => {
            return sum1 + review.ratings.reduce((sum2, rating) => sum2 + rating, 0);
        }, 0);

        console.log(overallRating);

        User.findByIdAndUpdate(
            user.id,
            {
                $set: {
                    'review.overallRating': overallRating
                }
            },{
                new: true
            }, function(err){
                if(err){
                    console.log(err);
                }
            });
    });
});
