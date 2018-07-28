const path = require("path");
const nodemailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const templatesDir = path.join(__dirname, "../templates");
const emailTemplates = require("email-templates");

const ROOT_URL = process.env.ROOT_URL;

const HACKATHON_NAME = process.env.HACKATHON_NAME;
const EMAIL_ADDRESS = process.env.EMAIL_ADDRESS;
const TWITTER_HANDLE = process.env.TWITTER_HANDLE;
const FACEBOOK_HANDLE = process.env.FACEBOOK_HANDLE;
const YEAR = process.env.YEAR;

const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_PORT = process.env.EMAIL_PORT;
const EMAIL_CONTACT = process.env.EMAIL_CONTACT;
let EMAIL_HEADER_IMAGE = process.env.EMAIL_HEADER_IMAGE;
if (EMAIL_HEADER_IMAGE.indexOf("https") == -1) {
    EMAIL_HEADER_IMAGE = ROOT_URL + EMAIL_HEADER_IMAGE;
}

const NODE_ENV = process.env.NODE_ENV;

const options = {
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: true,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
};

const transporter = nodemailer.createTransport(smtpTransport(options));

const controller = {};

controller.transporter = transporter;

function sendOne(templateName, options, data, callback) {
    if (NODE_ENV === "dev") {
        console.log(templateName);
        console.log(JSON.stringify(data, "", 2));
    }

    emailTemplates(templatesDir, (err, template) => {
        if (err) {
            return callback(err);
        }

        data.emailHeaderImage = EMAIL_HEADER_IMAGE;
        data.emailAddress = EMAIL_ADDRESS;
        data.hackathonName = HACKATHON_NAME;
        data.twitterHandle = TWITTER_HANDLE;
        data.facebookHandle = FACEBOOK_HANDLE;
        data.year = YEAR;

        template(templateName, data, (err, html, text) => {
            if (err) {
                return callback(err);
            }

            transporter.sendMail({
                from: EMAIL_CONTACT,
                to: options.to,
                subject: options.subject,
                html,
                text,
            }, (err, info) => {
                if (callback) {
                    callback(err, info);
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
controller.sendVerificationEmail = function (email, token, callback) {
    const options = {
        to: email,
        subject: `[${HACKATHON_NAME}] - Verify your email`,
    };

    const locals = {
        verifyUrl: `${ROOT_URL}/verify/${token}`,
    };

    /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
    sendOne("email-verify", options, locals, (err, info) => {
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

/**
 * Send a password recovery email.
 * @param  {[type]}   email    [description]
 * @param  {[type]}   token    [description]
 * @param  {Function} callback [description]
 */
controller.sendPasswordResetEmail = function (email, token, callback) {
    const options = {
        to: email,
        subject: `[${HACKATHON_NAME}] - Password reset requested!`,
    };

    const locals = {
        title: "Password Reset Request",
        subtitle: "",
        description: "Somebody (hopefully you!) has requested that your password be reset. If "
      + "this was not you, feel free to disregard this email. This link will expire in one hour.",
        actionUrl: `${ROOT_URL}/reset/${token}`,
        actionName: "Reset Password",
    };

    /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
    sendOne("email-link-action", options, locals, (err, info) => {
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

/**
 * Send a password recovery email.
 * @param  {[type]}   email    [description]
 * @param  {Function} callback [description]
 */
controller.sendPasswordChangedEmail = function (email, callback) {
    const options = {
        to: email,
        subject: `[${HACKATHON_NAME}] - Your password has been changed!`,
    };

    const locals = {
        title: "Password Updated",
        body: "Somebody (hopefully you!) has successfully changed your password.",
    };

    /**
   * Eamil-verify takes a few template values:
   * {
   *   verifyUrl: the url that the user must visit to verify their account
   * }
   */
    sendOne("email-basic", options, locals, (err, info) => {
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
