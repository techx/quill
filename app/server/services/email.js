var path = require('path');
var request = require('request');
var moment = require('moment');

var sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

var templatesDir = path.join(__dirname, '../templates');
var emailTemplates = require('email-templates');
var qr_generator = require('./qr-generator');

var ROOT_URL = process.env.ROOT_URL;

var HACKATHON_NAME = process.env.HACKATHON_NAME;
var EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
var TWITTER_HANDLE = process.env.TWITTER_HANDLE;
var FACEBOOK_HANDLE = process.env.FACEBOOK_HANDLE;

var EMAIL_CONTACT = process.env.EMAIL_CONTACT;
var EMAIL_HEADER_IMAGE = process.env.EMAIL_HEADER_IMAGE;
if(EMAIL_HEADER_IMAGE.indexOf("https") == -1){
  EMAIL_HEADER_IMAGE = ROOT_URL + EMAIL_HEADER_IMAGE;
}

var NODE_ENV = process.env.NODE_ENV;

var controller = {};


function sendOne(templateName, options, data, callback){

  if (NODE_ENV === "dev") {
    console.log(templateName);
    console.log(JSON.stringify(data, "", 2));
  }

  emailTemplates(templatesDir, function(err, template){
    if (err) {
        request
            .post(process.env.SLACK_HOOK,
                {
                    form: {
                        payload: JSON.stringify({
                            "text":
                            "``` \n" +
                            "Data: \n " +
                            JSON.stringify(data, null, 2) +
                            "\n ------------------------------------ \n" +
                            "\nError:\n" +
                            JSON.stringify(err, null, 2) +
                            "``` \n"
                        })
                    }
                },
                function (error, response, body) {
                    return response.status(500).send({
                        message: "Your error has been recorded, we'll get right on it!"
                    });
                }
            );
      return callback(err);
    }

    data.emailHeaderImage = EMAIL_HEADER_IMAGE;
    data.emailAddress = EMAIL_ADDRESS;
    data.hackathonName = HACKATHON_NAME;
    data.twitterHandle = TWITTER_HANDLE;
    data.facebookHandle = FACEBOOK_HANDLE;
    template(templateName, data, function(err, html, text){
      if (err) {
        return callback(err);
      }

      var msg = {
        to: options.to,
        from: EMAIL_CONTACT,
        subject: options.subject,
        text: text,
        html: html,
      };

      sgMail.send(msg, (err, result) => {
        if (err) {
          return callback(err)
        }
      });

    });
  });
}

/**
 * Send a verification email to a user, with a verification token to enter.
 * @param  {[type]}   email    [description]
 * @param  {[type]}   token    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
controller.sendVerificationEmail = function(email, token, callback) {

  var options = {
    to: email,
    subject: "["+HACKATHON_NAME+"] - Verify your email"
  };

  var locals = {
    verifyUrl: ROOT_URL + '/verify/' + token
  };

  /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
  sendOne('email-verify', options, locals, function(err, info){
    if (err){
      console.log(err);
    }
    if (info){
      console.log(info.message);
    }
    if (callback){
      callback(err, info);
    }
  });

};

/**
 * Send a password recovery email.
 * @param  {[type]}   email    [description]
 * @param  {[type]}   token    [description]
 * @param  {Function} callback [description]
 */
controller.sendPasswordResetEmail = function(email, token, callback) {

  var options = {
    to: email,
    subject: "["+HACKATHON_NAME+"] - Password reset requested!"
  };

  var locals = {
    title: 'Password Reset Request',
    subtitle: '',
    description: 'Somebody (hopefully you!) has requested that your password be reset. If ' +
      'this was not you, feel free to disregard this email. This link will expire in one hour.',
    actionUrl: ROOT_URL + '/reset/' + token,
    actionName: "Reset Password"
  };

  /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
  sendOne('email-link-action', options, locals, function(err, info){
    if (err){
      console.log(err);
    }
    if (info){
      console.log(info.message);
    }
    if (callback){
      callback(err, info);
    }
  });

};

/**
 * Send a password recovery email.
 * @param  {[type]}   email    [description]
 * @param  {Function} callback [description]
 */
controller.sendPasswordChangedEmail = function(email, callback){

  var options = {
    to: email,
    subject: "["+HACKATHON_NAME+"] - Your password has been changed!"
  };

  var locals = {
    title: 'Password Updated',
    body: 'Somebody (hopefully you!) has successfully changed your password.',
  };

  /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
  sendOne('email-basic', options, locals, function(err, info){
    if (err){
      console.log(err);
    }
    if (info){
      console.log(info.message);
    }
    if (callback){
      callback(err, info);
    }
  });

};

/**
 * Send an acceptance email.
 * @param  {[type]}   email    [description]
 * @param  {Function} callback [description]
 */
controller.sendAcceptanceEmail = function(email, confirmBy, callback) {

  var options = {
    to: email,
    subject: "["+HACKATHON_NAME+"] - Application Update"
  };

  date = new Date(confirmBy);
  // Hack for timezone
  var confirmDeadline = moment(date).format('dddd, MMMM Do YYYY, h:mm a') +
    " " + date.toTimeString().split(' ')[2];

  var locals = {
    title: 'Congratulations!',
    subtitle: '',
    description: 'Woohoo! You have been accepted to ' + HACKATHON_NAME +  '. We can\'t wait to see you get hacking!',
    confirmDeadline: confirmDeadline,
    actionUrl: ROOT_URL,
    actionName: "Go to Your Dashboard"
  };

  /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
  sendOne('email-acceptance', options, locals, function(err, info){
    if (err){
      console.log(err);
    }
    if (info){
      console.log(info.message);
    }
    if (callback) {
      callback(err, info);
    }
  });

};

/**
 * Send a confirmation email.
 * @param  {[type]}   email    [description]
 * @param  {Function} callback [description]
 */
controller.sendConfirmationEmail = function(user, callback) {

  var options = {
    to: user.email,
    subject: "["+HACKATHON_NAME+"] - Attendance Confirmation"
  };

  var locals = {
    title: 'You\'re all set for ' + HACKATHON_NAME + '!',
    subtitle: '',
    qr_payload: encodeURIComponent(qr_generator.generateCheckInPayload(user))
  };

  /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
  sendOne('email-confirmation', options, locals, function(err, info){
    if (err){
      console.log(err);
    }
    if (info){
      console.log(info.message);
    }
    if (callback) {
      callback(err, info);
    }
  });

};

module.exports = controller;
