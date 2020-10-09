var path = require('path');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var request = require('request');
var moment = require('moment');

var templatesDir = path.join(__dirname, '../templates');
var Email = require('email-templates');
var qr_generator = require('./qr-generator');

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

//If using regular emails to send from
var options = {
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: true,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
};
// //If using SendGrid API
// var options = {
//   service: "SendGrid",
//   auth: {
//       user: EMAIL_USER,
//       pass: EMAIL_PASS
//   }
// };

var transporter = nodemailer.createTransport(smtpTransport(options));

var controller = {};

controller.transporter = transporter;

function sendOne(templateName, options, data, callback) {
  if (NODE_ENV === "dev") {
    console.log(templateName);
    console.log(JSON.stringify(data, "", 2));
  }

  const email = new Email({
    message: {
      from: EMAIL_ADDRESS
    },
    send: true,
    transport: transporter
  });

  data.emailHeaderImage = EMAIL_HEADER_IMAGE;
  data.emailAddress = EMAIL_ADDRESS;
  data.hackathonName = HACKATHON_NAME;
  data.twitterHandle = TWITTER_HANDLE;
  data.facebookHandle = FACEBOOK_HANDLE;

  email.send({
    locals: data,
    message: {
      subject: options.subject,
      to: options.to
    },
    template: path.join(__dirname, "..", "emails", templateName),
  }).then(res => {
    if (callback) {
      callback(undefined, res)
    }
  }).catch(err => {
    if (callback) {
      callback(err, undefined);
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
 * Send an email to a sponsor with their login credientials.
 * @param  {[type]}   email    [description]
 * @param  {[type]}   password    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
controller.sendSponsorEmailandPassword = function(email, password, callback) {
  var options = {
    to: email,
    subject: "["+HACKATHON_NAME+"] - Sponsor: Accessing the Sponsors Portal!"
  };

  var locals = {
    title: 'Accessing the HackTX Sponsors Portal',
    actionUrl: ROOT_URL + '/login',
    actionName: 'Login to your Account',
    body: "Thank you for your interest in sponsoring HackTX! As part of your sponsorship, \
          we will grant you access to our attendees' resumes through the sponsors portal. \
          Before we do this, please log in and fill out our sponsorship application so we \
          have all the necessary information needed from you. We have set up an account \
          with this email and the password provided below. If you have any questions at any \
          point, please reach out to your point of contact. And we hope to see you soon at \
          HackTX!",        
    password: password
  };

    

  /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
  sendOne('email-sponsors', options, locals, function(err, info){
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
 * Send a email to a walk in user, with a verification token to enter.
 * @param  {[type]}   email    [description]
 * @param  {[type]}   token    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
controller.sendWalkinEmail = function(email, token, callback) {
  console.log("TEST");
  var options = {
    to: email,
    subject: "["+HACKATHON_NAME+"] - Register now!"
  };

  var locals = {
    verifyUrl: ROOT_URL + '/walkin/' + token
  };

  /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
  sendOne('email-verify', options, locals, function(err, info){
    if (err){
      console.log("TEST1");
      console.log(err);
    }
    if (info){
      console.log("TEST2");
      console.log(info.message);
    }
    if (callback){
      console.log("TEST3");
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
    " " + date.toTimeString().split(' ')[2] + ")";

  var locals = {
    title: 'Congratulations!',
    subtitle: '',
    description: 'Woohoo! You have been accepted to ' + HACKATHON_NAME +  '. We can\'t wait to see you get hacking! You have until ' + confirmDeadline + ' to accept your spot!',
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
  sendOne('email-link-action', options, locals, function(err, info){
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
 * Send a deferrence email.
 * @param  {[type]}   email    [description]
 * @param  {Function} callback [description]
 */
controller.sendDeferredEmail = function(email, callback) {

  var options = {
    to: email,
    subject: "["+HACKATHON_NAME+"] - Application Update"
  };

    var locals = {
      title: 'You\'ve been deferred',
      subtitle: '',
      description: 'This isn\'t bad news! It just means that we felt your application did not answer enough about you and your hopes for HackTX. We would still love to see you there so please take this opportunity to edit your application responses, and our team will be more than happy to review it once more after the final registration deadline on October 9th.',
      actionUrl: ROOT_URL,
      actionName: "Go to Your Dashboard"
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
  sendOne('email-link-action', options, locals, function(err, info){
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
 * Send a reminder to fill out the application.
 * @param  {[type]}   email    [description]
 * @param  {[type]}   token    [description]
 * @param  {Function} callback [description]
 */
controller.sendApplicationReminderEmail = function(email, callback) {

  var options = {
    to: email,
    subject: "["+HACKATHON_NAME+"] - Last Day to Register for HackTX 2020!"
  };

  var locals = {
    title: 'Finish your Application',
    subtitle: '',
    description: 'We noticed that you made an account for ' + HACKATHON_NAME + ' but have \
                  not finished filling out the application. Registration closes <strong>TONIGHT at \
                  11:59pm central time</strong>, so get your application submitted by \
                  then if you are still interested in participating!!<br><br> Make sure that a confirmation \
                  message appears when you submit your application. If you have trouble submitting, \
                  email hello@freetailhackers.com.',
    actionUrl: ROOT_URL + '/login',
    actionName: "Login to your Account"
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
 * Send a reminder to fill out the application.
 * @param  {[type]}   email    [description]
 * @param  {[type]}   token    [description]
 * @param  {Function} callback [description]
 */
controller.sendConfirmationReminderEmail = function(email, callback) {

  var options = {
    to: email,
    subject: "["+HACKATHON_NAME+"] - Accept Your Spot!!"
  };

  var locals = {
    title: 'Accept Your Spot!!',
    subtitle: '',
    description: 'Congrats again on your acceptance to ' + HACKATHON_NAME + '! We noticed that you \
                  have not let us know of your decision to attend yet. You can either confirm or deny your spot \
                  through the registration portal. We have extended the deadline to Octber 9th 11:59 pm CT, \
                  but please don\'t wait to get this done! If you \
                  have trouble confirming your spot, email hello@freetailhackers.com .',
    actionUrl: ROOT_URL + '/login',
    actionName: "Confirm your Spot"
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

module.exports = controller;
