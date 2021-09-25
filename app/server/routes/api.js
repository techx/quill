var UserController = require('../controllers/UserController');
var SettingsController = require('../controllers/SettingsController');
var ForumController = require('../controllers/ForumController');
var UpdatesController = require('../controllers/UpdatesController');
var User = require('../models/User');
var json2csv = require('json2csv').parse;
var path = require('path');

var request = require('request');
const {add} = require("nodemon/lib/rules");

module.exports = function(router) {

  function getToken(req){
    return req.headers['x-access-token'];
  }

  /**
   * Using the access token provided, check to make sure that
   * you are, indeed, an admin.
   */
  function isAdmin(req, res, next){

    var token = getToken(req);

    UserController.getByToken(token, function(err, user){

      if (err) {
        return res.status(500).send(err);
      }

      if (user && user.admin){
        req.user = user;
        return next();
      }

      return res.status(401).send({
        message: 'Get outta here, punk!'
      });

    });
  }

  /**
   *  Same check for mentor
   */
  function isMentor(req, res, next){
    var token = getToken(req);

    UserController.getByToken(token, function(err, user){
      if (err) {
        return res.status(500).send(err);
      }

      if (user && user.mentor){
        req.user = user;
        return next();
      }

      return res.status(401).send({
        message: 'Get outta here, punk!'
      });

    });
  }

  /**
   * [Users API Only]
   *
   * Check that the id param matches the id encoded in the
   * access token provided.
   *
   * That, or you're the admin, so you can do whatever you
   * want I suppose!
   */
  function isOwnerOrAdmin(req, res, next){
    var token = getToken(req);
    var userId = req.params.id;

    UserController.getByToken(token, function(err, user){

      if (err || !user) {
        return res.status(500).send(err);
      }

      if (user._id == userId || user.admin){
        return next();
      }
      return res.status(400).send({
        message: 'Token does not match user id.'
      });
    });
  }

  /**
   * Default response to send an error and the data.
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  function defaultResponse(req, res){
    return function(err, data){
      if (err){
        // SLACK ALERT!
        if (process.env.NODE_ENV === 'production'){
          request
            .post(process.env.SLACK_HOOK,
              {
                form: {
                  payload: JSON.stringify({
                    "text":
                    "``` \n" +
                    "Request: \n " +
                    req.method + ' ' + req.url +
                    "\n ------------------------------------ \n" +
                    "Body: \n " +
                    JSON.stringify(req.body, null, 2) +
                    "\n ------------------------------------ \n" +
                    "\nError:\n" +
                    JSON.stringify(err, null, 2) +
                    "``` \n"
                  })
                }
              },
              function (error, response, body) {
                return res.status(500).send({
                  message: "Your error has been recorded, we'll get right on it!"
                });
              }
            );
        } else {
          return res.status(500).send(err);
        }
      } else {
        return res.json(data);
      }
    };
  }

  /**
   *  API!
   */

  // ---------------------------------------------
  // Forums
  // ---------------------------------------------

  /**
   * check if forum can be created
   */
  function canCreateForum(req, res, next){
    var teamName = req.body.teamName;

    User
        .find({
          teamCode : teamName,
        }).count(function (err, count) {
                    if (err || count > 1)
                        return res.status(401).send({
                          message: 'Unable to create forum - already exist'
                        });
                    else
                        next();
        });
  }

  /**
   * create new forums when opening new team
   */
  router.put('/forums/create', canCreateForum, function(req, res, count){
      var teamName = req.body.teamName;

      ForumController.createNewForum(teamName, defaultResponse(req, res));
  });


  /**
   *  Get - Get mentor relevant forums names
   */
  router.get('/forums/mentor', function(req, res){
    ForumController.getAllForumsMentor(defaultResponse(req, res));
  });


  /**
   *  Get - Get mentor relevant forums
   */
  router.get('/forums/rec/:id', function(req, res){
    var id = req.params.id;
    ForumController.getForum(id, defaultResponse(req, res));
  });


  /**
   *  Get - Get hacker relevant forums
   */
  router.get('/forums/:teamName', function(req, res){
    var teamName = req.params.teamName;
    ForumController.getAllForumsHacker(teamName, defaultResponse(req, res));
  });


  /**
   * Post - send message in relevant forum
   */
  router.post('/forums/send', function(req, res){
      var forumID = req.body.forumID;
      var message = req.body.message;
      var user = req.body.user;
      var date = Date.now();

      ForumController.sendMessage(forumID, message, date, user, defaultResponse(req, res));
  });

  /**
   * POST - Post all forums that have new messages.
   */
  router.post('/forums/updateAll', function(req, res) {
    var forums = req.body.forums;
    ForumController.checkForUpdates(forums, defaultResponse(req, res));
  });

  /**
   * Delete - Delete forum only if last user left team. (only teams w/o mentor forums)
   */
  router.delete('/forums/:team', function (req, res){
      var team = req.params.team;
      ForumController.deleteForum(team, defaultResponse(req, res));
  });

  // ---------------------------------------------
  // Mentors
  // ---------------------------------------------

  router.get('/users/mentors', isOwnerOrAdmin, function(req, res){
    UserController.getMentors(defaultResponse(req, res));
  });

  // ---------------------------------------------
  // Updates
  // ---------------------------------------------

  /**
   * PUT - add new event update
   */
  router.put('/updates/update', function (req, res) {
    var message = req.body.message;
    UpdatesController.update(message, defaultResponse(req, res));
  });

  /**
   * GET - get all updates (from specific index)
   */
  router.get('/updates/getUpdates/:index', function (req, res) {
    var index = req.params.index;
    UpdatesController.getUpdates(index, defaultResponse(req, res));
  });

  // ---------------------------------------------
  // Users
  // ---------------------------------------------

  /**
   * [ADMIN ONLY]
   *
   * GET - Get all users, or a page at a time.
   * ex. Paginate with ?page=0&size=100
   */

  router.get('/users', isAdmin, function(req, res){
    var query = req.query;

    if (query.page && query.size){

      UserController.getPage(query, defaultResponse(req, res));

    } else {

      UserController.getAll(defaultResponse(req, res));

    }
  });

  /**
   * GET - Get all users include mentors, select relevant data only
   */
  router.get('/users/generalForum', function (req, res) {
    UserController.getAllForForum(defaultResponse(req, res));
  });

  /**
   * [ADMIN ONLY]
   */
  router.get('/users/stats', isAdmin, function(req, res){
    UserController.getStats(defaultResponse(req, res));
  });

  router.get('/users/exportcsv', isAdmin, function(req, res, next){
    function timeStamp() {
      // Create a date object with the current time
      var now = new Date();
       // Create an array with the current month, day and time
      var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];

        // Create an array with the current hour, minute and second
      var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];

       // Determine AM or PM suffix based on the hour
      var suffix = ( time[0] < 12 ) ? "AM" : "PM";

       // Convert hour from military time
      time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;

       // If hour is 0, set it to 12
      time[0] = time[0] || 12;

       // If seconds and minutes are less than 10, add a zero
      for ( var i = 1; i < 3; i++ ) {
        if ( time[i] < 10 ) {
          time[i] = "0" + time[i];
        }
      }

       // Return the formatted string
      return '_'+date.join("-") + "_" + time.join("-") + "_" + suffix;
    }

    var filename = "export_quill_users" + timeStamp() + ".csv";

    var fields = ['_id','email','verified','timestamp','lastUpdated',
                  'profile.adult','profile.name','profile.school',
                  'profile.company','mentor', 'profile.round1come','profile.round2come','profile.round3come',
                  'profile.round1go','profile.round2go','profile.round3go',
                  'profile.gender','profile.graduationYear',
                  'profile.description','profile.essay','status.name',
                  'status.completedProfile','status.admitted',
                  'status.confirmed','status.declined','status.checkedIn',
                  'status.reimbursementGiven',
                ];
    var fs = require('fs');

    User.find({}, function (err, users_data) {
      if (err) {
        return res.status(501).json({err});
      }
      else {
        let csv;
        try {
          csv = json2csv(users_data, {fields});
        } catch (err) {
          console.log(err);
          return res.status(502).json({err});
        }
        const filePath = path.join(__dirname, "../..","client","assets",filename);
        fs.writeFile(filePath, csv, function (err) {
          if (err) {
            return res.json(err).status(503);
          }
          else {
            setTimeout(function () {
              fs.unlinkSync(filePath);
            }, 30000);
            return res.json({
              path: "/assets/" + filename,
              filename: filename
            });
          }
        });
      }
    });
  });

  /**
   * [OWNER/ADMIN]
   *
   * GET - Get a specific user.
   */
  router.get('/users/:id', isOwnerOrAdmin, function(req, res){
    UserController.getById(req.params.id, defaultResponse(req, res));
  });

  /**
   * [OWNER/ADMIN]
   *
   * PUT - Update a specific user's profile.
   */
  router.put('/users/:id/profile', isOwnerOrAdmin, function(req, res){
    var profile = req.body.profile;
    var id = req.params.id;
    var teamLeader = req.body.teamLeader;

    UserController.updateProfileById(id, profile , teamLeader, defaultResponse(req, res));
  });

  /**
   *  PUT - update a specific user's forums
   */
  router.put('/users/forums', function(req, res){
    var id = req.body.id;
    var forums = req.body.forums;
    UserController.updateForumsById(id, forums , defaultResponse(req, res));
  });

  /**
   * [OWNER/ADMIN]
   *
   * PUT - Update a specific user's confirmation information.
   */
  router.put('/users/:id/confirm', isOwnerOrAdmin, function(req, res){
    var confirmation = req.body.confirmation;
    var id = req.params.id;

    UserController.updateConfirmationById(id, confirmation, defaultResponse(req, res));
  });

  /**
   * [OWNER/ADMIN]
   *
   * POST - Decline an acceptance.
   */
  router.post('/users/:id/decline', isOwnerOrAdmin, function(req, res){
    var confirmation = req.body.confirmation;
    var id = req.params.id;

    UserController.declineById(id, defaultResponse(req, res));
  });

  /**
   * Get a user's team member's names. Uses the code associated
   * with the user making the request.
   */
  router.get('/users/:id/team', isOwnerOrAdmin, function(req, res){
    var id = req.params.id;
    UserController.getTeammates(id, defaultResponse(req, res));
  });

  /**
   * Get a user's team member's names job and picture. Uses the code associated
   * with the user making the request.
   */
  router.get('/users/:team/membersteam', function(req, res){
    var team = req.params.team;
    UserController.getMembersByTeam(team, defaultResponse(req, res));
  });

  /**
   * Get a user's team member's names job and picture. Uses the code associated
   * with the user making the request.
   */
  router.get('/users/:team/mentorforum', function(req, res){
    var team = req.params.team;
    UserController.getMentorForumMembers(team, defaultResponse(req, res));
  });

  /**
   * Update a teamcode. Join/Create a team here.
   * {
   *   code: STRING
   * }
   */
  router.put('/users/:id/team', isOwnerOrAdmin, function(req, res){
    var code = req.body.code;
    var id = req.params.id;

    UserController.createOrJoinTeam(id, code, defaultResponse(req, res));
  });

  /**
   * Remove a user from a team.
   */
  router.delete('/users/:id/team', isOwnerOrAdmin, function(req, res){
    var id = req.params.id;

    UserController.leaveTeam(id, defaultResponse(req, res));
  });

  /**
   * Gets all the confirmed attendees
   */
  router.get('/users/:id/attendees', isOwnerOrAdmin, function(req, res) {
    var query = req.query;
    var id = req.params.id;

    UserController.getAttendeesPage(id, query, defaultResponse(req, res));
  });
  
  /*
   * Add grade to a user from a team.
   */
  router.put('/users/:id/grades', function(req, res){
    var id = req.params.id;
    var grade = req.body.grade;

    UserController.addGrade(id, grade, defaultResponse(req, res));
  });


  /**
   * Get a user's team grades.
   */
  router.get('/users/scoring/grades', function(req, res){
    UserController.getGrades(defaultResponse(req, res));
  });

  /**
   * Get a user's team names.
   */
  router.get('/users/scoring/teamNames', function(req, res){
    UserController.getTeamNames(defaultResponse(req, res));
  });

  /**
   * Update a user's password.
   * {
   *   oldPassword: STRING,
   *   newPassword: STRING
   * }
   */
  router.put('/users/:id/password', isOwnerOrAdmin, function(req, res){
    return res.status(304).send();
    // Currently disable.
    // var id = req.params.id;
    // var old = req.body.oldPassword;
    // var pass = req.body.newPassword;

    // UserController.changePassword(id, old, pass, function(err, user){
    //   if (err || !user){
    //     return res.status(400).send(err);
    //   }
    //   return res.json(user);
    // });
  });

  /**
   * Admit a user. ADMIN ONLY, DUH
   *
   * Also attaches the user who did the admitting, for liabaility.
   */
  router.post('/users/:id/admit', isAdmin, function(req, res){
    // Accept the hacker. Admin only
    var id = req.params.id;
    var user = req.user;
    UserController.admitUser(id, user, defaultResponse(req, res));
  });

  /**
   * Check in a user. ADMIN ONLY, DUH
   */
  router.post('/users/:id/checkin', isAdmin, function(req, res){
    var id = req.params.id;
    var user = req.user;
    UserController.checkInById(id, user, defaultResponse(req, res));
  });

  /**
   * Check out a user. ADMIN ONLY, DUH
   */
  router.post('/users/:id/checkout', isAdmin, function(req, res){
    var id = req.params.id;
    var user = req.user;
    UserController.checkOutById(id, user, defaultResponse(req, res));
  });

  /**
   * Make user an admin
   */
  router.post('/users/:id/makeadmin', isAdmin, function(req, res){
    var id = req.params.id;
    var user = req.user;
    UserController.makeAdminById(id, user, defaultResponse(req, res));
  });

  /**
   * Demote user
   */
  router.post('/users/:id/removeadmin', isAdmin, function(req, res){
    var id = req.params.id;
    var user = req.user;
    UserController.removeAdminById(id, user, defaultResponse(req, res));
  });


  // ---------------------------------------------
  // Settings [ADMIN ONLY!]
  // ---------------------------------------------

  /**
   * Get the public settings.
   * res: {
   *   timeOpenRegistration: Number,
   *   timeCloseRegistration: Number,
   *   timeToConfirm: Number,
   *   acceptanceText: String,
   *   confirmationText: String,
   *   allowMinors: Boolean
   * }
   */
  router.get('/settings', function(req, res){
    SettingsController.getPublicSettings(defaultResponse(req, res));
  });

  /**
   * Update the acceptance text.
   * body: {
   *   text: String
   * }
   */
  router.put('/settings/waitlist', isAdmin, function(req, res){
    var text = req.body.text;
    SettingsController.updateField('waitlistText', text, defaultResponse(req, res));
  });

  /**
   * Update the acceptance text.
   * body: {
   *   text: String
   * }
   */
  router.put('/settings/acceptance', isAdmin, function(req, res){
    var text = req.body.text;
    SettingsController.updateField('acceptanceText', text, defaultResponse(req, res));
  });

  /**
   * Update the confirmation text.
   * body: {
   *   text: String
   * }
   */
  router.put('/settings/confirmation', isAdmin, function(req, res){
    var text = req.body.text;
    SettingsController.updateField('confirmationText', text, defaultResponse(req, res));
  });

  /**
   * Update the confirmation date.
   * body: {
   *   time: Number
   * }
   */
  router.put('/settings/confirm-by', isAdmin, function(req, res){
    var time = req.body.time;
    SettingsController.updateField('timeConfirm', time, defaultResponse(req, res));
  });

  /**
   * Set the registration open and close times.
   * body : {
   *   timeOpenRegistration: Number,
   *   timeCloseRegistration: Number
   * }
   */
  router.put('/settings/Registrationtimes', isAdmin, function(req, res){
    var open = req.body.timeOpenRegistration;
    var close = req.body.timeCloseRegistration;
    SettingsController.updateRegistrationTimes(open, close, defaultResponse(req, res));
  });

    /**
   * Set the hackathon open and close times.
   * body : {
   *   timeOpenHackathon: Number,
   *   timeCloseHackathon: Number
   * }
   */
     router.put('/settings/hackathonTimes', isAdmin, function(req, res){
      var open = req.body.timeOpenHackathon;
      var close = req.body.timeCloseHackathon;
      SettingsController.updateHackathonTimes(open, close, defaultResponse(req, res));
    });
  
  
  /**
   * Get the whitelisted emails.
   *
   * res: {
   *   emails: [String]
   * }
   */
  router.get('/settings/whitelist', isAdmin, function(req, res){
    SettingsController.getWhitelistedEmails(defaultResponse(req, res));
  });

  /**
   * Get open scoring.
   *
   * res: {
   *   emails: [String]
   * }
   */
  router.get('/settings/openScoring', function(req, res){
    SettingsController.getOpenScoring(defaultResponse(req, res));
  });

  /**
   * [ADMIN ONLY]
   * {
   *   emails: [String]
   * }
   * res: Settings
   *
   */
  router.put('/settings/whitelist', isAdmin, function(req, res){
    var emails = req.body.emails;
    SettingsController.updateWhitelistedEmails(emails, defaultResponse(req, res));
  });

  /**
   * Get the companys whitelisted emails.
   *
   * res: {
   *   emails: [String]
   * }
   */
   router.get('/settings/companysWhitelist', isAdmin, function(req, res){
    SettingsController.getCompanysWhitelistedEmails(defaultResponse(req, res));
  });

  /**
   * [ADMIN ONLY]
   * {
   *   companys emails: [String]
   * }
   * res: Settings
   *
   */
  router.put('/settings/companysWhitelist', isAdmin, function(req, res){
    var emails = req.body.emails;
    SettingsController.updateCompanysWhitelistedEmails(emails, defaultResponse(req, res));
  });

  /**
   * [ADMIN ONLY]
   * {
   *   allowMinors: Boolean
   * }
   * res: Settings
   *
   */
  router.put('/settings/minors', isAdmin, function(req, res){
    var allowMinors = req.body.allowMinors;
    SettingsController.updateField('allowMinors', allowMinors, defaultResponse(req, res));
  });

  /**
   * [ADMIN ONLY]
   * {
   *   openScoring: Boolean
   * }
   * res: Settings
   *
   */
  router.put('/settings/scoring', isAdmin, function(req, res){
    var openScoring = req.body.openScoring;
    SettingsController.updateField('openScoring', openScoring, defaultResponse(req, res));
  });

};
