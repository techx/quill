var User = require('../models/User');
var Settings = require('../models/Settings');

var ReviewController = {};

/**
 * Returns sorted descending list of applicants by their rating
 * @type {Promise<any>}
 */
var rankRating = function (callback) {
    User.find({
        verified: true,
        admin: false
    }).sort({
        'review.overallRating': 'desc'
    }).exec(callback);
};

/**
 * Returns sorted descending list of admins by their review number
 * @type {Promise<any>}
 */
var rankCount = function (callback) {
    User.find({
        verified: true,
        admin: true
    }).sort({
        'review.reviewCount': 'asc'
    }).exec(callback);
};

/**
 * Assigns user for review. Will not reassign, or assign more than allowed
 * @param id
 * @param callback
 */
var assignReview = function (userId, callback) {
    rankCount(function (err, adminUsers) {
        if (err || !adminUsers) {
            return callback(err);
        }

        User.findById(userId).exec(function(err, user){
            if(err){
                return callback(err);
            }

            // Get number of reviewers
            Settings.getReview(function (err, settings) {
                var reviewers = (settings.reviewers - user.review.reviewers.length); // remaining reviewers need to assign

                // assign to remaining reviewers. Will not assign if already fulfilled
                for(var i = 0; i < reviewers && i < adminUsers.length; i++){

                    // assign user to reviewer
                    User.findOneAndUpdate({
                        _id: adminUsers[i]._id,
                        verified: true
                    }, {
                        $push: {
                            'review.reviewQueue': userId,
                        },
                        $set: {
                            'review.reviewCount': ++adminUsers[i].review.reviewCount,
                        }
                    }, {
                        new: true
                    }, function (err) {
                        if (err) {
                            return callback(err);
                        }
                    });

                    // assign reviewer to user
                    User.findOneAndUpdate({
                        _id: userId,
                        verified: true
                    }, {
                        $push: {
                            'review.reviewers': {
                                email: adminUsers[i].email,
                                ratings: [],
                                comments: ''
                            }
                        }
                    }, {
                        new: true
                    }, function(err){
                        if(err){
                            return callback(err);
                        }
                    });
                }
                callback();
            });
        });
    });
};


/**
 * Release all decisions for applicants
 * Top X amount is accepted (set in settings)
 * Rest is split evenly into Waitlist/Reject
 * @param callback
 */
ReviewController.release = function (callback) {
    rankRating(function (err, users) {
        if (err) {
            return callback(err);
        }

        // Get the number of acceptances
        Settings.getPublicSettings(function (err, settings) {
            var total = users.length;
            var admissions = settings.admissions;
            var waitlists = (total - admissions) / 2;

            // Decide each student
            users.forEach(function (user) {
                var setOptions = {
                    'status.admitted': false,
                    'status.rejected': false,
                    'status.waitlisted': false,
                };
                if (admissions > 0) {
                    admissions--;
                    setOptions['status.admitted'] = true;
                } else if (waitlists > 0) {
                    waitlists--;
                    setOptions['status.waitlisted'] = true;
                } else {
                    setOptions['status.rejected'] = true;
                }

                // Update user
                Settings.getRegistrationTimes(function (err, times) {
                    setOptions['status.confirmBy'] = times.timeConfirm;
                    User
                        .findOneAndUpdate({
                                _id: user._id,
                                verified: true
                            }, {
                                $set: setOptions
                            }, {
                                new: true
                            },
                            function (err) {
                                if (err) {
                                    return callback(err);
                                }
                            });
                });
            });
            callback();
        });
    });
};

/**
 * Assigns user for review. Will not reassign, or assign more than allowed
 * @param id
 * @param callback
 */
ReviewController.assignReview = function (id, callback) {
    assignReview(id, callback);
};


/**
 * Assigns all submitted users for review
 * @param id
 * @param callback
 */
ReviewController.assignReviews = function (callback) {
    User.find({
        verified: true,
        admin: false,
        'status.submitted': true
    }, function(err, users){
        if(err){
            return callback(err);
        }

        // lazy and inefficient but works
        users.forEach(function(user){
           assignReview(user._id, function(err){
               if(err){
                   return callback(err);
               }
           });
        });
        callback();
    });
};


/**
 * Gets the user queue for the specific admin id
 * @param id
 * @param callback
 */
ReviewController.getQueue = function (user, callback) {
    User.findById(user._id).exec(function (err, user) {
        if(err){
            return callback(err);
        }
        callback(err, user.review.reviewQueue);
    });
};

/**
 * Updates a user's review
 * @param userId
 * @param adminUser
 * @param ratings
 * @param comments
 * @param callback
 */
ReviewController.updateReview = function (userId, adminUser, ratings, comments, callback) {
    // Grab user
    User.findById(userId).exec(function(err, user){
        // add rating and assign overall rating
        var overallRating = user.review.overallRating + ratings.reduce(function(sum, val){return sum+val});

        // update review
        User.findOneAndUpdate({
            _id: userId,
            verified: true,
            'review.reviewers.email': adminUser.email
        }, {
            $push: {
                'review.reviewers': {
                    email: adminUser.email,
                    ratings: ratings,
                    comments: comments
                },
            $set: {
                    'review.reviewers.$.ratings': ratings,
                    'review.reviewers.$.comments': comments,
                    'review.overallRating': overallRating
                }
            }
        }, {
            new: true
        }, function(err, user){
            // pop the user from the admin's queue
            User.findOneAndUpdate({
                _id: adminUser._id,
                verified: true,
                admin: true
            }, {
                $pull: {
                    'review.reviewQueue': userId,
                }
            }, callback);
        });
    }, function(err){
        if(err){
            callback(err);
        }
    });
};

module.exports = ReviewController;
