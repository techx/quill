var Forum = require("../models/ForumData");

var ForumController = {};

ForumController.getByToken = function (token, callback) {
    Forum.getByToken(token, callback);
};

/**
 * Create new forum
 * @param teamName
 * @param callback // default response
 */
ForumController.createNewForum = function (teamName, callback) {
    var forumMentor = new Forum();
    var forumTeam = new Forum();
    forumMentor.forumType = 'mentor';
    forumTeam.forumType = 'team';
    forumMentor.team = teamName;
    forumTeam.team = teamName;

    forumMentor.save(function (err, forumAdded1) {
        if (err) {
            return callback.status(401).send({
                message: 'Unable to create forum - check DB'
            });
        } else {
            forumTeam.save((function (err, forumAdded) {
                if (err) {
                    return callback.status(401).send({
                        message: 'Unable to create forum - check DB'
                    });
                } else {
                    return callback(
                        null,
                        {
                            forum1: forumAdded,
                            forum2: forumAdded1
                        });
                }
            }));
        }
    });
};


/**
 * GET - get all user mentor's forums.
 * @param {Function} callback
 */
ForumController.getAllForumsMentor = function (callback) {
    Forum
        .find({$or: [{forumType: "mentor"}, {forumType: "general"}]},
            function (err, forums) {
                if (err)
                    return callback.status(401).send({
                        message: err.message
                    });
            }).select('lastMessage forumType team').exec(callback);
};


/**
 *  GET - get forum by id
 * @param forumID
 * @param {function} callback
 */
ForumController.getForum = function (forumID, callback) {
    Forum
        .findOne({_id: forumID},
            function (err, forum) {
                if (err)
                    return callback.status(401).send({
                        message: err.message
                    });
            }).exec(callback);
};


/**
 *  GET - get all hacker's forums.
 * @param teamName
 * @param callback
 */
ForumController.getAllForumsHacker = function (teamName, callback) {
    Forum
        .find(
            {$or: [{team: teamName}, {forumType: "general"}]},
            function (err, forums) {
                if (err)
                    return callback.status(401).send({
                        message: err.message
                    });
            }).select('lastMessage forumType team').exec(callback);
};



/**
 * GET - get all forums with new messages
 * @param forums
 * @param callback
 */
ForumController.checkForUpdates = function(forums, callback){
    var queries = [];
    var remove = [];
    var map = new Map();
    var forumToUpdate;

    forums.forEach(forum => {
        if (forum.update)
            forumToUpdate = forum.id;
        queries.push(forum.id);
        map.set(forum.id, forum.lastMessage);
    });

    Forum
        .find(
            { _id : {$in: queries}},
            function (err, forumsReceived) {
                if (err)
                    return callback.status(401).send({
                        message: err.message
                    });

                forumsReceived.forEach((forum, index) => {          // check forum id's to remove
                    if (forum.lastMessage === map.get(forum._id.toString())){
                        remove.push(index);
                    }
                });

                for (var i = remove.length -1; i >= 0; i--){        // remove forums with no update
                    forumsReceived.splice(remove[i], 1);
                }

                forumsReceived.forEach(currForum => {               // remove messages except the forum to update
                    currForum.messages = currForum._id === forumToUpdate ? null : currForum.messages.slice(map.get(JSON.stringify(currForum._id)));
                });

                return callback(
                    null,
                    {
                        forums: forumsReceived
                    });
            });
};


/**
 * add new message to forum
 * @param {String} forumID
 * @param {String} message
 * @param {Date} date
 * @param {String} user
 * @param  Function} callback args(err, user)
 */
ForumController.sendMessage = function (forumID, message, date, user, callback) {
    var newMessage = {
        message: message,
        time: date,
        user: user,
        visible: {
            type: String,
            enum: {
                values: 'all toSelf specific'.split(' '),
            }
        }
    };

    Forum.findByIdAndUpdate({
        _id: forumID,
    }, {
        $push: {messages: newMessage},
        $inc: {lastMessage: 1},
    }, {
        new: true,
    }, callback);
};

/**
 * DELETE - Delete all forum of deleted team
 * @param  {String} team - team name
 * @param  {Function} callback args(err, user)
 */
ForumController.deleteForum = function (team, callback){
    Forum
        .deleteMany({
           team: team
        },callback);
};

module.exports = ForumController;
