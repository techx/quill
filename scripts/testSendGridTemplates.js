// Script to test every (dynamic) SendGrid email template with SendGrid email API
// The env email address should recieve every template type defined in ENV (sent from itself)
require('dotenv').load();

var Mailer = require('../app/server/services/sendgrid_email');
var email = process.env.EMAIL_ADDRESS;
var templates = ['verification','passwordChanged','passwordReset','accepted', 'waiver'];
var mailCheck = function (templateIndex) {
    var ret = function (err, data) {
        if (!err && data) {
            console.warn('Email for template ' + templates[templateIndex] + ' sent');
        }
    };
    return ret;
};

Mailer.sendVerificationEmail(email, 'testToken', mailCheck(0));
Mailer.sendPasswordChangedEmail(email, 'firstName', mailCheck(1));
Mailer.sendPasswordResetEmail(email, 'firstName', 'testToken', mailCheck(2));
Mailer.sendAcceptanceEmail(email, 0, mailCheck(3));
Mailer.sendWaiverEmail(email, mailCheck(4));

