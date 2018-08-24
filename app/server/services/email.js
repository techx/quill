var moment = require('moment');

var path = require('path');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var templatesDir = path.join(__dirname, '../templates');
var emailTemplates = require('email-templates');
var xoauth2 = require('xoauth2')

var ROOT_URL = process.env.ROOT_URL;

var HACKATHON_NAME = process.env.HACKATHON_NAME;
var EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
var TWITTER_HANDLE = process.env.TWITTER_HANDLE;
var FACEBOOK_HANDLE = process.env.FACEBOOK_HANDLE;

var EMAIL_HOST = process.env.EMAIL_HOST;
var EMAIL_USER = process.env.EMAIL_USER;
var EMAIL_PASS = process.env.EMAIL_PASS;
var EMAIL_PORT = process.env.EMAIL_PORT;

var SMTP_CLIENT_ID = process.env.SMTP_CLIENT_ID;
var SMTP_CLIENT_SECRET = process.env.SMTP_CLIENT_SECRET;
var SMTP_CLIENT_REFRESH = process.env.SMTP_CLIENT_REFRESH;

var EMAIL_CONTACT = process.env.EMAIL_CONTACT;
var EMAIL_HEADER_IMAGE = process.env.EMAIL_HEADER_IMAGE;
if(EMAIL_HEADER_IMAGE.indexOf("https") == -1){
  EMAIL_HEADER_IMAGE = ROOT_URL + EMAIL_HEADER_IMAGE;
}

var NODE_ENV = process.env.NODE_ENV;

var aws = require('aws-sdk');
aws.config.update({
  region: 'us-west-2',
  accessKeyId: process.env.AWS_EMAIL_ACCESS,
  secretAccessKey: process.env.AWS_EMAIL_SECRET
});

var ses = new aws.SES({apiVersion: '2010-12-01'});

var options = {
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: true,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
};

var transporter = nodemailer.createTransport(smtpTransport(options));

var controller = {};

controller.transporter = transporter;

function sendOne(templateName, options, data, callback){

  if (NODE_ENV === "dev") {
    console.log(templateName);
    console.log(JSON.stringify(data, "", 2));
  }

  emailTemplates(templatesDir, function(err, template){
    if (err) {
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

      var params = {
        Destination: { /* required */
          ToAddresses: [
            options.to,
          ]
        },
        Message: { /* required */
          Body: { /* required */
            Html: {
             Charset: "UTF-8",
             Data: html
            },
            Text: {
             Charset: "UTF-8",
             Data: text
            }
           },
           Subject: {
            Charset: 'UTF-8',
            Data: options.subject
           }
          },
        Source: EMAIL_CONTACT, /* required */
      };

      ses.sendEmail(params, (err, data) => {
        callback(err, data);
      });

      // transporter.sendMail({
      //   from: EMAIL_CONTACT,
      //   to: options.to,
      //   subject: options.subject,
      //   html: html,
      //   text: text
      // }, function(err, info){
      //   if(callback){
      //     callback(err, info);
      //   }
      // });
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
 * Send the acceptance email to the participant.
 * @param  {[type]}   email     [description]
 * @param  {[type]}   confirmBy [description]
 * @param  {Function} callback  [description]
 */
controller.sendAcceptanceEmail = function(email, confirmBy, callback) {

  var options = {
    to: email,
    subject: "[HackUCI 2018] - Congratulations! You're in!"
  };

  var locals = {
    title: 'Welcome to HackUCI 2018!',
    description: 'Congratulations on getting accepted into HackUCI 2018! We are excited to have you at Orange County\'s largest hackathon. Please sign into your dashboard to confirm or decline your spot by ' + moment(confirmBy).format('MMMM D, YYYY h:mm A') + '. We look forward to seeing you!',
    actionUrl: 'https://www.hackuci.com/dashboard',
    actionName: "Dashboard"
  };

  /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
  sendOne('email-link-action', options, locals, function(err, info) {
    if (err) {
      console.log('mailer error: ' + err);
    }
    if (info) {
      console.log('mailer info: ' + info.message);
    }
    if (callback) {
      callback(err, info);
    }
  });

};

/**
 * Send the waiver email to the participant.
 * @param  {[type]}   email     [description]
 * @param  {Function} callback  [description]
 */
controller.sendWaiverEmail = function(email, callback) {

  var options = {
    to: email,
    subject: "[ACTION REQUIRED] Sign Your HackUCI Waiver Documents"
  };

  var locals = {
    title: 'Welcome to HackUCI 2018!',
    description: 'Congratulations on getting accepted into HackUCI 2018! Please sign our waiver documents below with this email address (' + email + '). Thank you for helping us save trees, and we look forward to seeing you!',
    actionUrl: 'https://app.hellosign.com/s/4bf9f65f',
    actionName: "Sign Waiver"
  };

  /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
  sendOne('email-link-action', options, locals, function(err, info) {
    if (err) {
      console.log(err);
    }
    if (info) {
      console.log(info.message);
    }
    if (callback) {
      callback(err, info);
    }
  });

};

module.exports = controller;
