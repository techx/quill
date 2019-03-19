require('dotenv').config();
// Connect to mongodb
var mongoose        = require('mongoose');
//var database        = process.env.DATABASE || "mongodb://localhost:27017";
var database = 'mongodb+srv://dho-dev:HACK5CAdmin@prod-s19-2vjv1.mongodb.net/test?retryWrites=true';
mongoose.connect(database, {useNewUrlParser: true});

var User = require('../app/server/models/User');
var Settings = require('../app/server/models/Settings');
var ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// CHANGE THIS ONLY
var reassignEmail = 'lharper@usc.edu';


/*terrible code below shield your eyes*/

var rankCount = function (callback) {
    var query = {
        verified: true,
        admin: true,
        email : {
            $nin: [ADMIN_EMAIL, reassignEmail]
        }
    };

    User.find(query).sort({
        'review.reviewCount': 1
    }).exec(callback);
};

// reassigns given list of users that need review
var reassign = function(users) {
    console.log('reassigning');
    Settings.getReview(function (err, settings) {
        // get the ascending list of admins without ADMIN_EMAIL and reassignEmail
        rankCount(function (err, admins) {
            // assign users to admins for review
            var adminIndex = 0;
            for (let i = 0; i < users.length; i++) {
                // assign only up to settings.reviewers
                var reviewers = settings.reviewers - users[i].review.reviewers.length;
                for (let j = 0; j < reviewers; j++) {

                    // do not assign to people who reviewed this person
                    while(users[i].review.reviewers.find((reviewer => {return reviewer.email === admins[adminIndex]}))){
                        adminIndex++;
                        if (adminIndex >= admins.length) {
                            adminIndex = 0;
                        }
                    }

                    // adminIndex loop and distribution
                    if (adminIndex >= admins.length) {
                        adminIndex = 0;
                    } else if (adminIndex < admins.length - 1 && admins[adminIndex].review.reviewCount < admins[adminIndex + 1].review.reviewCount) {
                        // assign to admins with lower reviewCounts
                        // when this happens, you've reached the next level of review counts, so go back to the start and iterate again
                        adminIndex = 0;
                    }

                    // debug
                    console.log(i+1 + ': assigning ' + users[i].email + ' to ' + admins[adminIndex].email);

                    // assign user to reviewer
                    User.findOneAndUpdate({
                        _id: admins[adminIndex].id,
                        verified: true
                    }, {
                        $push: {
                            'review.reviewQueue': users[i].id,
                        },
                        $inc: {
                            'review.reviewCount': 1,
                        }
                    }, {
                        new: true
                    }, function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });

                    // assign reviewer to user
                    User.findOneAndUpdate({
                        _id: users[i].id,
                        verified: true
                    }, {
                        $push: {
                            'review.reviewers': {
                                email: admins[adminIndex].email,
                                ratings: [],
                                comments: ''
                            }
                        }
                    }, {
                        new: true
                    }, function (err) {
                        if (err) {
                            console.log(err);
                        }
                    });
                    adminIndex++;
                }
            }
        });
    });
};


// remove assignment for both reviewee and reviewer,
// the reassign
User.findOne({
    email: reassignEmail,
}, function(err, reassignUser){
    if(err){
        console.log(err);
    }
    // delete the queue and reset the admin
    User.findOneAndUpdate({
        email: reassignEmail
    },{
        $set : {
            'review.reviewCount': 0,
            'review.reviewQueue': [],
        }
    },{
        new: true,
    },function(err, reassignUser){
        if(err){
            console.log(err);
        }
    });

    var promises = [];
    // update each reviewee
    reassignUser.review.reviewQueue.forEach(function(revieweeId){
        var promise = new Promise(function(resolve, reject){
            User.findOneAndUpdate({
                _id: revieweeId,
            },{
                $pull : {
                    'review.reviewers' : {
                        email: reassignEmail
                    }
                }
            },{
                new: true,
            }, function(err, revieweeUser){
                if(err){
                    reject(err);
                }
                resolve(revieweeUser);
            });
        });
        promises.push(promise);
    });
    Promise.all(promises).then(function(users){
        // can begin process of reassigning
        reassign(users);
    });
});
