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
      description: 'TLDR; Check in on our <a href="https://register.hacktx.com">registration portal</a>, join our <a href="https://https://discord.gg/QhDHJpM">Discord channel</a>, confirm your spot if you haven’t already, look at HackTX schedule!<br><br>' +
        'Congratulations on being accepted to HackTX! We are so excited to have you join us this upcoming weekend. As we prepare for the hackathon, we want to provide you with some more information about what to expect at HackTX 2020. This email will be lengthy but try to skim through to get the important info!<br>' +
        '<br> 💫 The biggest things you need to do right now is: 💫<br>1) Check into HackTX in the <a href="https://register.hactx.com">registration portal<a> <br> 2) Join our <a href="https://discord.gg/QhDHJpM">Discord channel</a> for announcements and updates.<br><br>' +
        'You will need to have confirmed your spot in your acceptance email to verify your account. In order to verify your account on discord, you have to click the ‘Check into HackTX’ button in the registration portal, and that will give you a verify command to paste into discord. Please be sure both things are done before the event! <br><br>' +
        'Additionally, please mark yourself as going on our <a href="https://www.facebook.com/events/2477372472560026/">Facebook Event page</a> for updates and reminders!<br><br>' + 
        'Tentative Schedule (All Times in CT):<br><br>Friday<br> 10 - 10:30 PM: Opening Ceremony<br>10:30 PM - 12 AM: Team Formation 1<br><br>' +
        'Saturday<br>7 - 8 AM: Team Formation 2<br>8 - 9 AM: Intro to Hackathons<br>9 - 10 AM: Intro to Git<br>10 - 11 AM: Intro to Mobile Dev<br>11 AM - 12 PM: Intro to Web Dev<br>12 - 1 PM: Intro ML<br>2 - 3 PM: Game Dev<br>5 - 7 PM: Career Fair (Make sure you have your resume ready!)<br>7 - 8 PM: Design Workshop, HackTeximathon<br>9:30 - 10:30 PM: Trivia Night<br>10:30 PM - 12 AM: Game Night<br>' +
        '<br>Sunday<br>1 - 2 AM: Smash Tournament<br>2 - 3 AM: League of Legends Tournament<br>9 - 10 AM: Pitching Workshop<br>11 AM SUBMISSIONS ARE DUE<br>11:30 AM - 1 PM: Judging<br>1 - 2 PM: Project Fair<br>2 - 3 PM: Closing Ceremony<br><br>' +
        'What should I do before I come to the event?<br>Brainstorm some ideas, get a team together! Look at our <a href="https://github.com/kdesai2018/ultimate-hackathon-starting-guide"Ultimate Hackathon Starting Guide</a> if you want more guidance. Also, make sure to make a discord account, as that will be our primary means of communication for everything HackTX.<br><br>' +
        'What is Discord and how do I use it?<br>Discord is a multi-platform group-chatting software. It allows us to give structure to our virtual hackathon, as well as creating a safe environment for you to meet other hackers and work together. We also hand-made a Discord bot that adds some additional features you might find useful. Just type !help in the bot commands channel for more info!<br><br>' +
        'How do prizes work? Are there different tracks?<br>We have two different tracks this year: a beginner’s track and a general track. Every project is automatically eligible for the general track, however, to be eligible for the beginner’s track, you will need to attend at least two of our beginner’s workshops. The beginner’s track is meant for teams who have never been to a hackathon before or are new to technology. The top 3 teams in the general track will win a prize and the top 1 team in the beginner’s track will win a prize. Additionally we will announce sponsor challenges at the event and each of those will have their own prize.<br><br>' +
        'When can I work on my project?<br>You may work on your project from 10:00 pm CT on 10/23 to 10:00 am CT on 10/25 . Please do not work on your project at other times as it will disqualify you from the judging rounds. This however, does not mean that what you make during HackTX cannot be the start of a bigger project to complete with your group, the hacker community, or on your own.<br><br>' +
        'What can I work on?<br>You can work on anything that uses technology! This can be a website/app, a video game, a VR/AR app, etc. Use your imagination to come up with a unique tech project!<br><br>' +
        'Do I need a team?<br>You don’t need one, but WE STRONGLY RECOMMEND joining a team! You can post in the Discord channel, our Facebook event page, or meet people during one of our 2 team formation sessions. Teams can be up to 5 people! The more the merrier!<br><br>' +
        'How do I get help at the event?<br>There will be mentors in our Discord so just use the Discord bot to ask for help! You can also always message an organizer for assistance.<br><br>' +
        'What if I have a question that wasn’t answered from above?<br>If you have a question, please email hello@freetailhackers.com or ping the #questions channel in Discord.<br><br>' +
        'WE ARE SO EXCITED TO (VIRTUALLY) MEET YOU! <br> <3 Freetail Hackers',
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
      description: 'Unfortunately, we are not able to offer you a spot at ' + HACKATHON_NAME + ' at this time. However, we are planning on accepting walk-ins to our event! This means that if you show up the evening of the event, we can get you signed up and ready to participate. As of right now, we don\'t have all the details fleshed out, but if you follow our event page https://fb.me/e/2NXXzEoKG, we will be posting more updates there.',
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
    subject: "["+HACKATHON_NAME+"] - Last Day to Register!!"
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
    subject: "["+HACKATHON_NAME+"] - Last Chance To Accept Your Spot!!"
  };

  var locals = {
    title: 'Accept Your Spot!!',
    subtitle: '',
    description: 'Congrats again on your acceptance to ' + HACKATHON_NAME + '! Just a reminder that \
                  your admission will expire <strong>TONIGHT at 11:59pm central time</strong>. You can \
                  confirm or deny your spot through the registration portal. If you run into any trouble, \
                  email hello@freetailhackers.com.',
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
