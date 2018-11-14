var UserController = require('../controllers/UserController');
var SettingsController = require('../controllers/SettingsController');
var request = require('request');

jwt        = require('jsonwebtoken');
JWT_SECRET = process.env.JWT_SECRET;

var aws = require('aws-sdk');
aws.config.update({
  region: 'us-west-1',
  accessKeyId: process.env.AWS_ACCESS,
  secretAccessKey: process.env.AWS_SECRET
});
var s3 = new aws.S3();
var s3BucketName = process.env.AWS_S3_BUCKET;

var multer = require('multer')
var multerS3 = require('multer-s3')
var uuidv4 = require('uuid/v4');

const google = require('googleapis')
const sheets = google.sheets('v4')

var hellosign = require('hellosign-sdk')({key: process.env.HELLOSIGN_KEY});

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_ID,
  process.env.GOOGLE_SECRET
)

oauth2Client.credentials.refresh_token = process.env.GOOGLE_REFRESH_TOKEN

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

  router.get('/users/waiver', (req, res) => {
    var token = getToken(req);
    UserController.getByToken(token, function(err, user){
      if (err) {
        return res.status(500).send(err);
      }
      
      email = user.email;

      hellosign.signatureRequest.list({
        query: email
      })
      .then(function(response){
        if(response.signature_requests.length) {
          signatureExists = response.signature_requests[0].signatures.find(signature => signature.signer_email_address === email)
          if(signatureExists) {
            res.send(200);
          } else {
            res.send(404);
          }
        } else {
          res.send(404)
        }
        
      })
      .catch(function(err){
        return res.status(500).send(err);
      });
    });
  })

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

    UserController.updateProfileById(id, profile , defaultResponse(req, res));
  });

  /**
   * [OWNER/ADMIN]
   *
   * PUT - Update a specific user's confirmation information.
   */
  router.put('/users/:id/confirm', isOwnerOrAdmin, function(req, res){
    var confirmation = req.body.confirmation;
    var id = req.params.id;

    if (confirmation.needsReimbursement) {
      oauth2Client.refreshAccessToken((err, tokens) => {
        if (err) return console.error(err)

        oauth2Client.credentials.access_token = tokens.access_token;
        var sheet = 'default';
        var sheetId = 197870237;

        // sets which sheet to insert to
        var email = UserController.getById(id, (error, user) => {
          if (user.profile.school === 'University of California-Los Angeles' ||
              user.profile.school === 'The University of California, Los Angeles' ||
              user.profile.school === 'UCLA') {
            sheet = 'UCLA'
            sheetId = 925052505
          } else if (user.profile.school === 'University of California-San Diego' ||
                     user.profile.school === 'The University of California, San Diego') {
            sheet = 'UCSD'
            sheetId = 698367773
          } else if (user.profile.school === 'University of Southern California') {
            sheet = 'USC'
            sheetId = 723023891
          }

          // get all emails to check for duplicates
          sheets.spreadsheets.values.get({
            spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
            range: sheet + '!B:B',
            auth: oauth2Client
          }, (err, result) => {
            if (err) return console.error(err)

            // add to waitlist iff the user needs transportation and isn't on the waitlist
            if (confirmation.needsReimbursement === '1' && !result.values.some((value) => {
              return JSON.stringify(value) === JSON.stringify(user.email.split())
            })) {
              sheets.spreadsheets.values.append({
                spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
                range: sheet + '!A1:B1',
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                  values: [
                    [new Date().toString(), user.email]
                  ]
                },
                auth: oauth2Client
              }, (err, response) => {
                if (err) return console.error(err)
              })
            } else if (confirmation.needsReimbursement === '0' && result.values.some((value) => {
              return JSON.stringify(value) === JSON.stringify(user.email.split())
            })) {
              // otherwise remove from waitlist if the user doesn't need transporation but is on the waitlist
              // first find the index of the row
              for (var i = 0; i < result.values.length; i++) {
                if (result.values[i][0] === user.email) {
                  // when found, send a delete request
                  sheets.spreadsheets.batchUpdate({
                    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
                    resource: {
                      requests: [
                        {
                          deleteDimension: {
                            range: {
                              sheetId: sheetId,
                              dimension: "ROWS",
                              startIndex: i,
                              endIndex: i + 1
                            }
                          }
                        }
                      ]
                    },
                    auth: oauth2Client
                  }, (err, response) => {
                    if (err) return console.error(err)
                  })

                  break;
                }
              }
            }
          })
        })
      });
    }

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
   * Check in a user. ADMIN ONLY, DUH
   */
  router.post('/users/:id/checkout', isAdmin, function(req, res){
    var id = req.params.id;
    var user = req.user;
    UserController.checkOutById(id, user, defaultResponse(req, res));
  });

  /**
   * Mark a user's waiver documents as signed.
   */
  router.post('/users/:id/sign', isAdmin, function(req, res){
    var id = req.params.id;
    UserController.getById(id, (error, user) => {
       UserController.markWaiverAsSigned(user.email, defaultResponse(req, res));
    });
  });

  /**
   * Send waiver email to the user.
   */
  router.post('/users/:id/sendwaiver', isAdmin, function(req, res){
    var id = req.params.id;
    UserController.sendWaiverEmail(id, defaultResponse(req, res));
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
   *   timeOpen: Number,
   *   timeClose: Number
   * }
   */
  router.put('/settings/times', isAdmin, function(req, res){
    var open = req.body.timeOpen;
    var close = req.body.timeClose;
    SettingsController.updateRegistrationTimes(open, close, defaultResponse(req, res));
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
   * Ping route for elastic load balancer
   */
  router.get('/ping', (req, res) => {
    res.sendStatus(200);
  });

  // multer S3 object to upload resumes
  var upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: s3BucketName,
      key: function (req, file, cb) {
        var authToken = req.headers['x-access-token'];
        jwt.verify(authToken, JWT_SECRET, (err, id) => {
          cb(err, id + '.pdf');
        });
      },
      limits: {
        fileSize: 512 * 1024, // max upload size is 512kb
      }
    })
  });

  // upload the resume to AWS S3 using the multer object defined above
  router.post('/resume/upload', upload.single('file'), (req, res) => {    
    res.send(200);
  });

  // get the resume of a given user
  router.get('/resume/:id', isOwnerOrAdmin, (req, res) => {
    // check to see if you can access this shiz and
    // check if the file exists in s3 anddd
    // take the id and put it in a jwt with 30 seconds of validity

    var id = req.params.id;    
    var fileName = id + '.pdf';

    var s3Params = {
      Bucket: s3BucketName,
      Key: fileName
    };

    s3.headObject(s3Params, (err, data) => {
      if (err) {
        res.sendStatus(404);
      } else {
        var token = jwt.sign({fileName: fileName}, JWT_SECRET, {expiresIn: '30s'});
        res.json({
          token: token
        });
      }
    });
  });

  router.get('/resume/view/:token', (req, res) => {
    // get a token returned by the above object
    // extract the filename then return the file

    var token = req.params.token
    jwt.verify(token, JWT_SECRET, (err, data) => {

      if (err) {
        res.sendStatus(401)
      } else {
        var s3Params = {
          Bucket: s3BucketName,
          Key: data.fileName
        };

        res.setHeader('Content-type', 'application/pdf');
        s3.getObject(s3Params).createReadStream().pipe(res);
      }
    })
  });

  /* [ADMIN ONLY]
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

};
