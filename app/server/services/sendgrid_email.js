var moment = require('moment');
var ROOT_URL = process.env.ROOT_URL;

var SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
var HACKATHON_NAME = process.env.HACKATHON_NAME;
var EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
var TWITTER_HANDLE = process.env.TWITTER_HANDLE;
var FACEBOOK_HANDLE = process.env.FACEBOOK_HANDLE;
var ACCEPTANCE_EMAIL_TEMPLATE = process.env.ACCEPTANCE_EMAIL_TEMPLATE;
var VERIFICATION_EMAIL_TEMPLATE = process.env.VERIFICATION_EMAIL_TEMPLATE;
var PASSWORD_RESET_EMAIL_TEMPLATE = process.env.PASSWORD_RESET_EMAIL_TEMPLATE;
var PASSWORD_CHANGED_EMAIL_TEMPLATE = process.env.PASSWORD_CHANGED_EMAIL_TEMPLATE;
var WAIVER_EMAIL_TEMPLATE = process.env.WAIVER_EMAIL_TEMPLATE;
var NODE_ENV = process.env.NODE_ENV;

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(SENDGRID_API_KEY);

var emailService = {};

/**
 * Send an email with a dynamic template using SendGrid email API
 * @param  {string}           template      [ID of SendGrid Dynamic Template]        
 * @param  {string|string[]}  email         [Email address(s) to send to]
 * @param  {Object}           templateData  [Mapping of template dynamic fields to values]
 * @param  {Function}         callback      [Callback to be executed on success or error]
 */
function sendOne(template, email, templateData, callback) {
  var msg = {
    to: email,
    from: EMAIL_ADDRESS,
    templateId: template,
    dynamic_template_data: templateData
  };
  sgMail.send(msg, (err, info) => {
    if (err) {
      console.error('Error sending email through SendGrid: ' + err);
    }
    if (info) {
      console.warn('Email with template ' + template + ' sent to ' + email + ' with response:\n');
      if (info[0] && info[0].toJSON) {
        console.warn(info[0].toJSON());
      }
      else {
        console.error("Ill-formed SendGrid response log"); 
      }
    }
    if (callback) {
      callback(err, info);
    }
  });
}

/**
 * Send a verification email to a user, with a verification token to enter.
 * @param  {string|string[]}  email         [Email address(s) to send to]
 * @param  {[type]}     token    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
emailService.sendVerificationEmail = function (email, token, callback) {
  var verifyUrlData = {
    url: `${ROOT_URL}/verify/${token}`
  };
  sendOne(VERIFICATION_EMAIL_TEMPLATE, email, verifyUrlData, callback);
};

/**
 * Send a password recovery email.
 * @param  {string|string[]}  email         [Email address(s) to send to]
 * @param  {string}   firstName
 * @param  {[type]}   token    [description]
 * @param  {Function} callback [description]
 */
emailService.sendPasswordResetEmail = function (email, firstName, token, callback) {
  var resetUrlData = {
    url: `${ROOT_URL}/reset/${token}`,
    firstName
  };
  sendOne(PASSWORD_RESET_EMAIL_TEMPLATE, email, resetUrlData, callback);
};

/**
 * Send a password recovery email.
 * @param  {string|string[]}  email         [Email address(s) to send to]
 * @param  {string}   firstName
 * @param  {Function} callback [description]
 */
emailService.sendPasswordChangedEmail = function (email, firstName, callback) {
  var confirmChangeData = {
    firstName
  };
  sendOne(PASSWORD_CHANGED_EMAIL_TEMPLATE, email, confirmChangeData, callback);
};

/**
 * Send the acceptance email to the participant.
 * @param  {string|string[]}  email         [Email address(s) to send to]
 * @param  {[type]}   confirmBy [description]
 * @param  {Function} callback  [description]
 */
emailService.sendAcceptanceEmail = function (email, firstName, confirmBy, callback) {
  acceptanceData = {
    FirstName: firstName,
    Link: `${ROOT_URL}/dashboard`, 
    date: moment(confirmBy).format('MMMM D, YYYY h:mm A') 
  };
  sendOne(ACCEPTANCE_EMAIL_TEMPLATE, email, acceptanceData, callback);
};

/**
 * Send the waiver email to the participant.
 * @param  {string|string[]}  email         [Email address(s) to send to]
 * @param  {Function} callback  [description]
 */
emailService.sendWaiverEmail = function (email, firstName, callback) {
  var waiverData = {
    email,
    FirstName: firstName
  };
  sendOne(WAIVER_EMAIL_TEMPLATE, email, waiverData, callback);
};

module.exports = emailService;
