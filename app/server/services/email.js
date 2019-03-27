var path = require('path');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var templatesDir = path.join(__dirname, '../templates');
var Email = require('email-templates');

var ROOT_URL = process.env.ROOT_URL;

var HACKATHON_NAME = process.env.HACKATHON_NAME;
var EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
var TWITTER_HANDLE = process.env.TWITTER_HANDLE;
var FACEBOOK_HANDLE = process.env.FACEBOOK_HANDLE;

var EMAIL_CONTACT= process.env.EMAIL_CONTACT;
var EMAIL_HOST= process.env.EMAIL_HOST;
var EMAIL_USER= process.env.EMAIL_USER;
var EMAIL_PASS= process.env.EMAIL_PASS;
var EMAIL_PORT= process.env.EMAIL_PORT;
var EMAIL_HEADER_IMAGE= process.env.EMAIL_HEADER_IMAGE;

var EMAIL_MASS_CONTACT_NAME= process.env.EMAIL_MASS_CONTACT_NAME;
var EMAIL_MASS_CONTACT= process.env.EMAIL_MASS_CONTACT;
var EMAIL_MASS_HOST= process.env.EMAIL_MASS_HOST;
var EMAIL_MASS_USER= process.env.EMAIL_MASS_USER;
var EMAIL_MASS_PASS= process.env.EMAIL_MASS_PASS;
var EMAIL_MASS_PORT= process.env.EMAIL_MASS_PORT;
var EMAIL_MASS_HEADER_IMAGE= process.env.EMAIL_MASS_HEADER_IMAGE;

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

var massOptions = {
  host: EMAIL_MASS_HOST,
  port: EMAIL_MASS_PORT,
  secure: true,
  auth: {
    user: EMAIL_MASS_USER,
    pass: EMAIL_MASS_PASS
  }
};

var transporter = nodemailer.createTransport(smtpTransport(options));
var massTransporter = nodemailer.createTransport(smtpTransport(massOptions));

var controller = {};

controller.transporter = transporter;

function sendOne(templateName, options, data, callback) {
  if (NODE_ENV === "dev") {
    console.log(templateName);
    console.log(JSON.stringify(data, "", 2));
  }

  const email = new Email({
    message: {
      from: EMAIL_CONTACT
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

function sendOneMass(sender, templateName, options, data, callback) {
  if (NODE_ENV === "dev") {
    console.log(templateName);
    console.log(JSON.stringify(data, "", 2));
  }

  const email = new Email({
    message: {
      from: sender
    },
    send: true,
    transport: massTransporter
  });

  data.emailHeaderImage = EMAIL_MASS_HEADER_IMAGE;
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
 * Send mass emails
 * @param sender
 * @param title
 * @param text
 * @param recipients
 * @param callback
 */

controller.sendMassMail = function(sender, title, text, recipients, callback){
  if(recipients.length <= 0){
    callback('No applicants of this type');
  }

  if(sender === undefined || sender === ''){
    sender = EMAIL_MASS_CONTACT;
  }else{
    sender = EMAIL_MASS_CONTACT_NAME + ' <' + sender + '>';
  }

  var error = null;
  var res = null;

  recipients.forEach(function(value){

    var options = {
      to: value,
      subject: "["+HACKATHON_NAME+"] - " + title,
    };

    var locals = {
      title: title,
      body: text,
    };

    sendOneMass(sender,'email-html', options, locals, function(err, info){
      if (err){
        console.log(err);
        error = err;
      }
      if (info){
        console.log(info.message);
        res = info;
      }
    });
  });

  callback(error, res);

};

controller.sendPostVerificationEmail = function(recipient, callback){
  var title = 'Thank you for verifying your email!';
  var text = "<p>Thank you for verifying your email! Now that you're here,\n" +
      "    we'd like to remind you of some upcoming opportunities and deadlines from HackSC.<br/><br/>We can't\n" +
      "    stress this enough: finish your <a href=\"https://apply.hacksc.com\" target=\"_blank\" rel=\"noopener\">application</a> as\n" +
      "    soon as possible. Admissions are sent out on a rolling basis and our 800 available slots are filling up\n" +
      "    fast.<br/><br/>Make sure you stay up to date with HackSC events on Facebook! Follow us on both <a\n" +
      "            href=\"https://www.facebook.com/hackscofficial/?ref=br_rs\" target=\"_blank\" rel=\"noopener\">main page</a> and\n" +
      "    our <a href=\"https://www.facebook.com/events/290482594997517/\" target=\"_blank\" rel=\"noopener\">event page</a> to be\n" +
      "    alerted about exciting sponsors, new developments, and general upcoming information.<br/>For many schools in California\n" +
      "    , we have special event pages where you can come together with other students from your school to organize\n" +
      "    teams and ideas for the hackathon. <br/>Register with your respective group to find out more!<br/> <a\n" +
      "            href=\"https://www.facebook.com/events/284086188936209/\" target=\"_blank\" rel=\"noopener\">Cal Poly Pomona\n" +
      "        Storms HackSC 2019</a><br/> <a href=\"https://www.facebook.com/events/302382230478821/\" target=\"_blank\"\n" +
      "                                       rel=\"noopener\">Cal Poly SLO Storms HackSC 2019</a><br/> <a\n" +
      "            href=\"https://www.facebook.com/events/322061758434120/\" target=\"_blank\" rel=\"noopener\">Stanford Storms\n" +
      "        HackSC 2019</a> <br/> <a href=\"https://www.facebook.com/events/349666215633740/\">UCLA Storms HackSC 2019</a>\n" +
      "    <br/> <a href=\"https://www.facebook.com/events/373148296834948/\" target=\"_blank\" rel=\"noopener\">UCI Storms HackSC\n" +
      "        2019</a> <br/> <a href=\"https://www.facebook.com/events/380098005873195/\">UCR Storms HackSC 2019</a><br/> <a\n" +
      "            href=\"https://www.facebook.com/events/770027986704880/\" target=\"_blank\" rel=\"noopener\">UCSD Storms HackSC\n" +
      "        2019</a> <br/> <a href=\"https://www.facebook.com/events/869008373444071/\" target=\"_blank\" rel=\"noopener\">CalTech\n" +
      "        Storms HackSC 2019</a><br/> <a href=\"https://www.facebook.com/events/1204885276302745/\" target=\"_blank\"\n" +
      "                                       rel=\"noopener\">UCSB Storms HackSC 2019</a><br/> <a\n" +
      "            href=\"https://www.facebook.com/events/2306022846332257/\" target=\"_blank\" rel=\"noopener\">Bay Area Storms\n" +
      "        HackSC 2019</a><br/><br/>If you're a USC student who needs to stay busy in the interim between now and\n" +
      "    HackSC on April 12, feel free to join us every Wednesday at GroundZero cafe for <a\n" +
      "            href=\"https://www.facebook.com/events/288801028472022/\" target=\"_blank\" rel=\"noopener\">HackSC Presents: Hack\n" +
      "        Nights</a>! Hack Nights are a weekly opportunity for cooperation and community-building centered around different\n" +
      "    themes. Each Hack Night allows for an environment to work on personal projects and homework, as well as unique\n" +
      "    workshops and presentations from speakers.<br/>Come by Hack Nights to indulge upon free food and participate in our\n" +
      "    giveaways! Our grand prize will be an Xbox One S, so make sure you keep showing up!<br/><br/>For more detailed\n" +
      "    breakdowns of what we've been up to, check us out on our <a\n" +
      "            href=\"https://medium.com/@hacksc/hacksc-2019-ready-to-blossom-be1c6aca1980\" target=\"_blank\" rel=\"noopener\">Medium</a>\n" +
      "    blog, and for appreciation of our stunning aesthetic and 280-character wit, follow us on <a\n" +
      "            href=\"https://www.instagram.com/hackscofficial/\" target=\"_blank\" rel=\"noopener\">Instagram</a> and <a\n" +
      "            href=\"https://twitter.com/hackscofficial\" target=\"_blank\" rel=\"noopener\">Twitter</a>!</p>\n";

  var options = {
    to: recipient,
    subject: "["+HACKATHON_NAME+"] - " + title,
  };

  var locals = {
    title: title,
    body: text,
  };

  sendOne('email-html', options, locals, function(err, info){
    if (err){
      console.log(err);
    }
    if (info){
      console.log(info.message);
    }
    if(callback){
      callback(err, info);
    }
  });
};

controller.sendStatusChangeEmail = function(recipient){
  var title = 'Application Update';
  var text = "An update has been made to your application. Please check your status at <a href='https://apply.hacksc.com'>apply.hacksc.com</a><br>" +
      "We wish you the best. If you have any questions, please reach out to us at hackers@hacksc.com";

  var options = {
    to: recipient,
    subject: "["+HACKATHON_NAME+"] - " + title,
  };

  var locals = {
    title: title,
    body: text,
  };

  var sender = EMAIL_MASS_CONTACT;
  sendOneMass(sender, 'email-html', options, locals, function(err, info){
    if (err){
      console.log(err);
    }
    if (info){
      console.log(info.message);
    }
  });
};

module.exports = controller;
