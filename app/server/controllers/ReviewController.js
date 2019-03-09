var User = require('../models/User');
var Settings = require('../models/Settings');
var ADMIN_EMAIL = process.env.ADMIN_EMAIL;

var ReviewController = {};

/**
 * Returns sorted descending list of submitted applicants by their rating
 */
var rankRating = function (callback) {
    User.find({
        verified: true,
        admin: false,
        'status.submitted': true
    }).sort({
        'review.overallRating': -1
    }).exec(callback);
};

/**
 * Returns sorted ascending list of admins by their review number
 * Does or does not include admin email
 */
var rankCount = function (includeAdminEmail, callback) {
    var query = {
        verified: true,
        admin: true,
    };
    if(!includeAdminEmail){
        query.email = {
            $ne: ADMIN_EMAIL
        }
    }

    User.find(query).sort({
        'review.reviewCount': 1
    }).exec(callback);
};

/**
 * Returns submissions list sorted by their rank
 * @param callback
 */
ReviewController.getSubmissionsList = function (callback) {
    rankRating(callback);
};

/**
 * Returns reviewers list sorted by their total review count
 * @param callback
 */
ReviewController.getReviewersList = function (callback) {
    rankCount(true, callback);
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
                                _id: user.id,
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
 * @param userId
 * @param callback
 */
ReviewController.assignReview = function (userId, callback) {
    rankCount(false, function (err, adminUsers) {
        if (err || !adminUsers) {
            return callback(err);
        }

        User.findById(userId).exec(function (err, user) {
            if (err) {
                return callback(err);
            }

            // Get number of reviewers
            Settings.getReview(function (err, settings) {
                var reviewers = (settings.reviewers - user.review.reviewers.length); // remaining reviewers need to assign

                // assign to remaining reviewers. Will not assign if already fulfilled
                for (var i = 0; i < reviewers && i < adminUsers.length; i++) {
                    // assign user to reviewer
                    User.findOneAndUpdate({
                        _id: adminUsers[i].id,
                        verified: true
                    }, {
                        $push: {
                            'review.reviewQueue': userId,
                        },
                        $inc: {
                            'review.reviewCount': 1,
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
                    }, function (err) {
                        if (err) {
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
 * Assigns all submitted users for review
 * @param id
 * @param callback
 */
ReviewController.assignReviews = function (callback) {
    Settings.getReview(function (err, settings) {
        if (err) {
            return callback(err);
        }

        // get the ascending list of admins
        rankCount(false, function (err, admins) {
            if (err) {
                return callback(err);
            }

            // find all users that need to be assigned
            User.find({
                verified: true,
                admin: false,
                'status.submitted': true,
            }, function (err, users) {
                if (err) {
                    return callback(err)
                }

                // assign all users to admins for review
                var adminIndex = 0;
                for (let i = 0; i < users.length; i++) {
                    // assign only up to settings.reviewers
                    var reviewers = settings.reviewers - users[i].review.reviewers.length;
                    for (let j = 0; j < reviewers; j++) {
                        // adminIndex loop and distribution
                        if (adminIndex >= admins.length) {
                            adminIndex = 0;
                        } else if (adminIndex < admins.length - 1 && admins[adminIndex].review.reviewCount < admins[adminIndex + 1].review.reviewCount) {
                            // assign to admins with lower reviewCounts
                            // when this happens, you've reached the next level of review counts, so go back to the start and iterate again
                            adminIndex = 0;
                        }
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
                                return callback(err);
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
                                return callback(err);
                            }
                        });
                        adminIndex++;
                    }
                }
            });
        });
    });
    callback();
};


/**
 * Gets the user queue for the specific admin id
 * @param user
 * @param callback
 */
ReviewController.getQueue = function (user, callback) {
    User.findById(user.id).exec(function (err, user) {
        if (err) {
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
    User.findById(userId).exec(function (err, user) {
        // add rating and assign overall rating
        var overallRating = user.review.overallRating + ratings.reduce(function (sum, val) {
            return sum + val
        });

        // update review
        User.findOneAndUpdate({
            _id: userId,
            verified: true,
            'review.reviewers.email': adminUser.email
        }, {
            $set: {
                'review.reviewers.$.ratings': ratings,
                'review.reviewers.$.comments': comments,
                'review.overallRating': overallRating
            },
        }, {
            new: true
        }, function (err, user) {
            // pop the user from the admin's queue
            User.findOneAndUpdate({
                _id: adminUser.id,
                verified: true,
                admin: true
            }, {
                $pull: {
                    'review.reviewQueue': userId,
                }
            }, callback);
        });
    }, function (err) {
        if (err) {
            callback(err);
        }
    });
};

module.exports = ReviewController;
