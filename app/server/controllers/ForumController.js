var Forum = require("../models/ForumData");

var ForumController = {};

ForumController.getByToken = function (token, callback) {
    Forum.getByToken(token, callback);
};

// callback is default response build
ForumController.createNewForum = function (teamName, callback) {
    var forumMentor = new Forum();
    var forumTeam = new Forum();
    forumMentor.forumType = 'mentor';
    forumTeam.forumType = 'team';
    forumMentor.team = teamName;
    forumTeam.team = teamName;

    forumMentor.save(function(err, forumAdded1) {
        if (err){
            return callback.status(401).send({
                message: 'Unable to create forum - check DB'
            });
        }
        else {
            forumTeam.save((function(err, forumAdded) {
                if (err){
                    return callback.status(401).send({
                        message: 'Unable to create forum - check DB'
                    });
                }
                else {
                    return callback(
                        null,
                        {
                            forum1: forumAdded,
                            forum2 : forumAdded1
                        });
                }
            }));
        }
    });
};

/**
 * get all Hacker(!) forums
 * @param teamName
 * @param callback
 */
ForumController.getAllForums = function (teamName, callback) {
    Forum.
        find({$or:[{team: teamName},{forumType:"general"}]}, function (err, forums){
           if (err)
               return callback.status(401).send({
                   message: err.message
               });
           else
               return callback(
                   null,
                   {
                       forums : forums
                   });
        });
};

/**
 * add new message to forum
 * @param forumID
 * @param message
 * @param date
 * @param user
 * @param callback
 */
ForumController.updateForum = function(forumID, message, date, user, callback){
    var newMessage = {
        message: message,
        time : date,
        user: user,
        visible : {
            type : String,
            enum : {
                values: 'all toSelf specific'.split(' '),
            }
        }};

    Forum.findByIdAndUpdate({
        _id :forumID,
    }, {
        $push : { messages : newMessage},
    }, {
        new : true,
    }, callback);
};


module.exports = ForumController;
