var User = require('../models/User');
var Mailer = require('../services/email');

var MailController = {};

var sendMassMail = function (query, sender, title, text, callback) {
    User.find(query,
        (err, res) => {
            if (err) {
                callback(err);
                return;
            }
            console.log(res);
            if(res.length === 0){
                // no recipients
                callback();
                return;
            }
            recipients = res.map(doc => doc.email);
            Mailer.sendMassMail(sender, title, text, recipients, callback);
        });
};

MailController.send = function (sender, title, text, recipient, callback) {
    // filter recipient
    switch (recipient) {
        case 'verified':
            sendMassMail({'verified': true}, sender, title, text, callback);
            break;
        case 'verified and not submitted':
            sendMassMail({'verified': true, 'status.submitted': false}, sender, title, text, callback);
            break;
        case 'submitted':
            sendMassMail({'status.submitted': true}, sender, title, text, callback);
            break;
        case 'admitted':
            sendMassMail({'status.admitted': true}, sender, title, text, callback);
            break;
        case 'rejected':
            sendMassMail({'status.rejected': true}, sender, title, text, callback);
            break;
        case 'waitlisted':
            sendMassMail({'status.waitlisted': true}, sender, title, text, callback);
            break;
        case 'admitted and not confirmed':
            sendMassMail({'status.admitted': true, 'status.confirmed': false}, sender, title, text, callback);
            break;
        case 'confirmed':
            sendMassMail({'status.confirmed': true}, sender, title, text, callback);
            break;
        case 'confirmed and need transportation':
            sendMassMail({'status.confirmed': true, 'profile.transportation': true, email: schoolRegex}, sender, title, text, callback);
            break;
        default:
            // custom, separate by email
            var recipients = recipient.split(',');
            Mailer.sendMassMail(sender, title, text, recipients, callback);
            break;
    }
};

MailController.sendSchool = function (sender, title, text, recipient, schoolRecipient, callback) {
    var schoolRegex = new RegExp('@' + schoolRecipient);
    console.log(schoolRegex);
    // filter recipient
    switch (recipient) {
        case 'verified':
            sendMassMail({'verified': true, email: schoolRegex}, sender, title, text, callback);
            break;
        case 'verified and not submitted':
            sendMassMail({'verified': true, 'status.submitted': false, email: schoolRegex}, sender, title, text, callback);
            break;
        case 'submitted':
            sendMassMail({'status.submitted': true, email: schoolRegex}, sender, title, text, callback);
            break;
        case 'admitted':
            sendMassMail({'status.admitted': true, email: schoolRegex}, sender, title, text, callback);
            break;
        case 'rejected':
            sendMassMail({'status.rejected': true, email: schoolRegex}, sender, title, text, callback);
            break;
        case 'waitlisted':
            sendMassMail({'status.waitlisted': true, email: schoolRegex}, sender, title, text, callback);
            break;
        case 'admitted and not confirmed':
            sendMassMail({'status.admitted': true, 'status.confirmed': false, email: schoolRegex}, sender, title, text, callback);
            break;
        case 'confirmed':
            sendMassMail({'status.confirmed': true, email: schoolRegex}, sender, title, text, callback);
            break;
        case 'confirmed and need transportation':
            sendMassMail({'status.confirmed': true, 'profile.transportation': true, email: schoolRegex}, sender, title, text, callback);
            break;
    }
};

MailController.sendPostVerificationEmail = function (recipient, callback) {
    Mailer.sendPostVerificationEmail(recipient, callback);
};

module.exports = MailController;
