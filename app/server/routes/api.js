var UserController = require('../controllers/UserController');
var SettingsController = require('../controllers/SettingsController');
var FileController = require('../controllers/FileController');
var MailController = require('../controllers/MailController');
var ReviewController = require('../controllers/ReviewController');

var request = require('request');

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
   * [ADMIN ONLY]
   */
  router.get('/users/stats', isAdmin, function(req, res){
    UserController.getStats(defaultResponse(req, res));
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

    UserController.updateProfileById(id, profile, defaultResponse(req, res));
  });

  /**
   * [OWNER/ADMIN]
   *
   * PUT - Submit's a user's application.
   */
  router.put('/users/:id/submit', isOwnerOrAdmin, function(req, res){
    var profile = req.body.profile;
    var id = req.params.id;

    UserController.submitById(id, profile, defaultResponse(req, res));
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
   * Changes the overall rating for the user. ADMIN ONLY
   */
  router.post('/users/:id/setOverallRating', isAdmin, function(req, res){
    // Mark the user for admit. Admin only
    var id = req.params.id;
    var user = req.user;
    var rating = req.body.rating;
    UserController.setOverallRating(id, user, rating, defaultResponse(req, res));
  });

  /**
   * Admit a user. ADMIN ONLY
   *
   * Also attaches the user who admitted, for liability.
   */
  router.post('/users/:id/admit', isAdmin, function(req, res){
    // Accept the hacker. Admin only
    var id = req.params.id;
    var user = req.user;
    UserController.admitUser(id, user, defaultResponse(req, res));
  });

  /**
   * Reject a user. ADMIN ONLY
   *
   * Also attaches the user who rejected, for liability.
   */
  router.post('/users/:id/reject', isAdmin, function(req, res){
    // Accept the hacker. Admin only
    var id = req.params.id;
    var user = req.user;
    UserController.rejectUser(id, user, defaultResponse(req, res));
  });

  /**
   * Waitlist a user. ADMIN ONLY
   *
   * Also attaches the user who waitlisted, for liability.
   */
  router.post('/users/:id/waitlist', isAdmin, function(req, res){
    // Accept the hacker. Admin only
    var id = req.params.id;
    var user = req.user;
    UserController.waitlistUser(id, user, defaultResponse(req, res));
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
   * Check in a user. ADMIN ONLY, DUH
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

  /**
   * Upload resume
   */
  router.put('/file/:id/upload', isOwnerOrAdmin, function(req, res){
    var metadata = req.body.metadata;
    var file = req.body.file;
    FileController.upload(metadata, file, defaultResponse(req, res));
  });

  /**
   * Update resume
   */
  router.put('/file/:id/update', isOwnerOrAdmin, function(req, res){
    var fileId = req.body.fileId;
    var metadata = req.body.metadata;
    var file = req.body.file;
    FileController.update(fileId, metadata, file, defaultResponse(req, res));
  });


  // ---------------------------------------------
  // Settings [ADMIN ONLY!]
  // ---------------------------------------------

  /**
   * Get the public settings.
   * res: {
   *   timeOpen: Number,
   *   timeClose: Number,
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
   * Update the waitlist text.
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
   * Update the rejection text.
   * body: {
   *   text: String
   * }
   */
  router.put('/settings/rejection', isAdmin, function(req, res){
    var text = req.body.text;
    SettingsController.updateField('rejectionText', text, defaultResponse(req, res));
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
   *   timeOpen: Number,
   *   timeClose: Number
   * }
   */
  router.put('/settings/times', isAdmin, function(req, res){
    var open = req.body.timeOpen;
    var close = req.body.timeClose;
    var closeUSC = req.body.timeCloseUSC;
    SettingsController.updateRegistrationTimes(open, close, closeUSC, defaultResponse(req, res));
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
   * Get the review criteria.
   *
   * res: {
   *   emails: [String]
   * }
   */
  router.get('/settings/review', isAdmin, function(req, res){
    SettingsController.getReview(defaultResponse(req, res));
  });

  /**
   * [ADMIN ONLY]
   * {
   *   reviewers: Number
   *   reviewCriteria: [String]
   * }
   * res: Settings
   *
   */
  router.put('/settings/review', isAdmin, function(req, res){
    var reviewers = req.body.reviewers;
    var reviewCriteria = req.body.reviewCriteria;
    SettingsController.updateReview(reviewers, reviewCriteria, defaultResponse(req, res));
  });

  /**
   * [ADMIN ONLY]
   * Get the judge criteria.
   *
   * res: {
   *   emails: [String]
   * }
   */
  router.get('/settings/judge', isAdmin, function(req, res){
    SettingsController.getJudge(defaultResponse(req, res));
  });

  /**
   * [ADMIN ONLY]
   * {
   *   judges: Number
   *   judgeCriteria: [String]
   * }
   * res: Settings
   *
   */
  router.put('/settings/judge', isAdmin, function(req, res){
    var judges = req.body.judges;
    var judgeCriteria = req.body.judgeCriteria;
    SettingsController.updateJudge(judges, judgeCriteria, defaultResponse(req, res));
  });

  /**
   * [ADMIN ONLY]
   * {
   *   admissions: Number
   * }
   * res: Settings
   *
   */
  router.put('/settings/admissions', isAdmin, function(req, res){
    var admissions = req.body.admissions;
    SettingsController.updateField("admissions", admissions, defaultResponse(req, res));
  });


  // ---------------------------------------------
  // Mail [ADMIN ONLY!]
  // ---------------------------------------------

  /**
   * [ADMIN ONLY]
   * Sends a mass mail to the intended recipients
   *
   */
  router.put('/mail/send', isAdmin, function(req, res){
    var sender = req.body.sender;
    var title = req.body.title;
    var text = req.body.text;
    var recipient = req.body.recipient;
    MailController.send(sender, title, text, recipient, defaultResponse(req, res));
  });

  /**
   * Sends a post verification email to self
   */
  router.put('/mail/sendPostVerificationEmail', isOwnerOrAdmin, function(req, res){
    var recipient = req.body.recipient;
    MailController.sendPostVerificationEmail(recipient, defaultResponse(req, res));
  });

  /**
   * [ADMIN ONLY]
   * Sends a mass mail to the intended recipients with school
   *
   */
  router.put('/mail/sendSchool', isAdmin, function(req, res){
    var sender = req.body.sender;
    var title = req.body.title;
    var text = req.body.text;
    var recipient = req.body.recipient;
    var schoolRecipient = req.body.schoolRecipient;
    MailController.sendSchool(sender, title, text, recipient, schoolRecipient, defaultResponse(req, res));
  });

  // ---------------------------------------------
  // Review [ADMIN ONLY!]
  // ---------------------------------------------

  /**
   * [ADMIN ONLY]
   * Returns submissions list sorted by their rank
   *
   */
  router.get('/review/list/submissions', isAdmin, function(req, res){
    ReviewController.getSubmissionsList(defaultResponse(req, res));
  });

  /**
   * [ADMIN ONLY]
   * Returns reviewers list sorted by their total review count
   *
   */
  router.get('/review/list/reviewers', isAdmin, function(req, res){
    ReviewController.getReviewersList(defaultResponse(req, res));
  });

  /**
   * [ADMIN ONLY]
   * Accepts the top number amount of applicants based on score.
   * The rest are half waitlisted half rejected.
   *
   */
  router.get('/review/release', isAdmin, function(req, res){
    ReviewController.release(defaultResponse(req, res));
  });

  /**
   * Assigns the given user for review
   * Can assign self
   *
   */
  router.get('/review/assign/:id', isOwnerOrAdmin, function(req, res){
    ReviewController.assignReview(req.params.id, defaultResponse(req, res));
  });

  /**
   * [ADMIN ONLY]
   * Assigns all submitted users for review
   *
   */
  router.get('/review/assign', isAdmin, function(req, res){
    ReviewController.assignReviews(defaultResponse(req, res));
  });
  /**
   * [ADMIN ONLY]
   * Returns the queue of users the admin has to review
   *
   */
  router.get('/review/queue', isAdmin, function(req, res){
    var user = req.user; // grab admin id
    ReviewController.getQueue(user, defaultResponse(req, res));
  });

  /**
   * [ADMIN ONLY]
   * Updates the user with the review
   *
   */
  router.put('/review/update', isAdmin, function(req, res){
    var adminUser = req.user;
    var userId = req.body.userId;
    var ratings = req.body.ratings;
    var comments = req.body.comments;
    ReviewController.updateReview(userId, adminUser, ratings, comments, defaultResponse(req, res));
  });

};
