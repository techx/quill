var User = require('../models/User');
var Settings = require('../models/Settings');
var async = require('async');

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
var assignReview = function (id, callback) {
    rankCount(function (err, users) {
        if (err || !users) {
            return callback(err);
        }

        User.findById(id).exec(function(err, user){
            if(err){
                return callback(err);
            }

            // Get number of reviewers
            Settings.getReview(function (err, settings) {
                var reviewers = settings.reviewers - user.review.reviewers.length;

                // assign to remaining reviewers. Will not assign if already fulfilled
                for(var i = 0; i < reviewers && i < users.length; i++){

                    // assign user to reviewer
                    User.findOneAndUpdate({
                        _id: users[i].id,
                        verified: true
                    }, {
                        $push: {
                            'review.reviewQueue': id,
                        },
                        $set: {
                            'review.reviewCount': ++users[i].review.reviewCount,
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

        // Set the number of acceptances
        Settings.getReview(function (err, settings) {
            var total = users.length;
            var acceptances = settings.acceptances;
            var waitlists = (total - acceptances) / 2;

            // Decide each student
            users.forEach(function (user) {
                var setOptions = {
                    'status.admitted': false,
                    'status.rejected': false,
                    'status.waitlisted': false,
                };
                if (acceptances > 0) {
                    acceptances--;
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
    }, function(err, users){
        if(err){
            return callback(err);
        }

        // lazy and inefficient but works
        users.forEach(function(user){
           assignReview(user.id, function(err){
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
    User.findById(user.id).exec(function (err, user) {
        if(err){
            return callback(err);
        }
        callback(err, user.review.reviewQueue);
    });
};

/**
 * Updates a user's review
 * @param id
 * @param user
 * @param rating
 * @param comment
 * @param callback
 */
ReviewController.updateReview = function (id, user, rating, comment, callback) {
    // assign reviewer to user
    User.findOneAndUpdate({
        _id: id,
        verified: true
    }, {
        $push: {
            'review.reviewers': {
                email: user.email,
                rating: rating,
                comment: comment
            },
        }
    }, {
        new: true
    }, function (err, user) {
        if (err) {
            return callback(err);
        }

        // calculate new rating
        var overallRating = user.review.overallRating + rating;
        User.findOneAndUpdate({
            _id: user.id,
            verified: true
        }, {
            $set: {
                'review.overallRating': overallRating
            }
        }, {
            new: true
        }, callback)
    });
};

module.exports = ReviewController;
