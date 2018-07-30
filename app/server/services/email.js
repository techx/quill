const emailTemplates = require("email-templates");
const path = require("path");
const sgMail = require("@sendgrid/mail");

const templatesDir = path.join(__dirname, "../templates");

const {
    EMAIL_ADDRESS,
    FACEBOOK_HANDLE,
    HACKATHON_NAME,
    ROOT_URL,
    TWITTER_HANDLE,
    YEAR,

    EMAIL_CONTACT,
    EMAIL_HEADER_IMAGE,

    NODE_ENV,
    SENDGRID_API_KEY,
} = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const controller = {};

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

        template(templateName, data, (templateErr, html, text) => {
            if (templateErr) {
                return callback(templateErr);
            }
            else {
                const msg = {
                    subject: options.subject,
                    to: options.to,
                    from: EMAIL_CONTACT,
                    html,
                    text,
                };

                sgMail.send(msg, false, (sendErr, results) => {
                    if (callback) {
                        return callback(sendErr, results);
                    }
                });
            }
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
            return callback(err, info);
        }
    });
};

module.exports = controller;
