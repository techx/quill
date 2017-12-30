var path = require('path');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var templatesDir = path.join(__dirname, '../templates');
var emailTemplates = require('email-templates');

const sgMail = require('@sendgrid/mail');

var ROOT_URL = process.env.ROOT_URL;

var HACKATHON_NAME = process.env.HACKATHON_NAME;
var EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
var TWITTER_HANDLE = process.env.TWITTER_HANDLE;
var FACEBOOK_HANDLE = process.env.FACEBOOK_HANDLE;

var EMAIL_HOST = process.env.EMAIL_HOST;
var EMAIL_USER = process.env.EMAIL_USER;
var EMAIL_PASS = process.env.EMAIL_PASS;
var EMAIL_PORT = process.env.EMAIL_PORT;
var EMAIL_CONTACT = process.env.EMAIL_CONTACT;
var EMAIL_HEADER_IMAGE = process.env.EMAIL_HEADER_IMAGE;
if(EMAIL_HEADER_IMAGE.indexOf("https") == -1){
  EMAIL_HEADER_IMAGE = ROOT_URL + EMAIL_HEADER_IMAGE;
}

var NODE_ENV = process.env.NODE_ENV;

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

      // using SendGrid's v3 Node.js Library
      // https://github.com/sendgrid/sendgrid-nodejs
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: options.to,
        from: EMAIL_CONTACT,
        subject: options.subject,
        text: text,
        html: html
      };
      sgMail.send(msg, (err, res) => {
        if (err) {
          const {message, code, response} = err;
          console.log("MAIL SEND ERROR: " + message + " code: " + code);
        }
        else {
          console.log(Date.now() + ": Mail sent to " + msg.to);
        }
        if (callback) {
          callback(err, res);
        }
      });

    });
  });
}

function sendMultiple(templateName, users, options, data, callback) {
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

      // using SendGrid's v3 Node.js Library
      // https://github.com/sendgrid/sendgrid-nodejs
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      var msgs = [];
      users.forEach(function(user) {
        msgs.push({
          to: user.email,
          from: EMAIL_CONTACT,
          subject: options.subject,
          text: text,
          html: html
        });
      });
      if (msgs.length > 0) {
        sgMail.send(msgs, (err, res) => {
          if (err) {
            const {message, code, response} = err;
            console.log("MAIL SEND ERROR: " + message + " code: " + code);
          }
          else {
            msgs.forEach((msg) => {
              console.log(Date.now() + ": Mail sent to " + msg.to);
            });
          }
          if (callback) {
            callback(err, res);
          }
        });
      }
    });
  });
}

/**
 * Send a mass email to a collection of users.
 * @param  {[User]}   users
 * @param  {[type]}   data
 * @param  {Function} callback
 */
controller.sendMassEmail = function(users, data, callback) {
  var options = {
    subject: data.subject,
  };

  var locals = {
    title: data.title ,
    subtitle: data.subtitle,
    description: data.description,
    actionUrl: data.actionUrl,
    actionName: data.actionName,
  };

  sendMultiple(locals.actionUrl ? 'email-link-action' : 'email-basic', users, options, locals, function(err, res){
    if (callback){
      callback(err, res);
    }
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
  sendOne('email-verify', options, locals, function(err, res){
    if (callback){
      callback(err, res);
    }
  });

};

/**
 * Send a confirmation email.
 * @param  {[type]}   email    [description]
 * @param  {Function} callback [description]
 */
controller.sendConfirmationEmail = function(email, callback) {

  var options = {
    to: email,
    subject: "["+HACKATHON_NAME+"] - Application Accepted! Confirm Now!"
  };

  var locals = {
    title: 'You\'re in! Confirm your application now!' ,
    subtitle: '',
    description: 'We think you\'re awesome, and would love you to be a part ' +
      'of this years event! We just need you to confirm some additional information.',
    actionUrl: ROOT_URL + '/confirmation',
    actionName: "Confirm Your Account"
  };

  /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
  sendOne('email-link-action', options, locals, function(err, res){
    if (callback){
      callback(err, res);
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
  sendOne('email-link-action', options, locals, function(err, res){
    if (callback){
      callback(err, res);
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
    description: 'Somebody (hopefully you!) has successfully changed your password.',
  };

  /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
  sendOne('email-basic', options, locals, function(err, res){
    if (callback){
      callback(err, res);
    }
  });

};

module.exports = controller;
