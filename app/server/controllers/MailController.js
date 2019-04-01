var User = require('../models/User');
var Mailer = require('../services/email');

var MailController = {};

var sendMassMail = function (query, sender, title, text, callback) {
    console.log('test');
    User.find(query,
        (err, res) => {
            if (err) {
                callback(err);
                return;
            }
            if(res.length === 0){
                // no recipients
                callback();
                return;
            }
            recipients = res.map(doc => doc.email);
            console.log(recipients);
            callback(err, res);
            //Mailer.sendMassMail(sender, title, text, recipients, callback);
        });
};

MailController.send = function (sender, title, text, recipient, schoolRecipient, callback) {
    var schoolRegex;
    if(schoolRecipient === 'all'){
        // match anything
        schoolRegex = new RegExp('');
    }else if(schoolRecipient === 'non-usc'){
        schoolRegex = {
            $not: new RegExp('@usc.edu')
        };
    }else{
        schoolRegex = new RegExp('@' + schoolRecipient);
    }

    // filter recipient
    switch (recipient) {
        case 'unverified':
            sendMassMail({'verified': false, email: schoolRegex}, sender, title, text, callback);
            break;
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
            sendMassMail({'status.admitted': true, 'status.declined': false, email: schoolRegex}, sender, title, text, callback);
            break;
        case 'rejected':
            sendMassMail({'status.rejected': true, email: schoolRegex}, sender, title, text, callback);
            break;
        case 'waitlisted':
            sendMassMail({'status.waitlisted': true, 'status.declined': false, email: schoolRegex}, sender, title, text, callback);
            break;
        case 'admitted and not confirmed':
            sendMassMail({'status.admitted': true, 'status.confirmed': false, 'status.declined': false, email: schoolRegex}, sender, title, text, callback);
            break;
        case 'confirmed':
            sendMassMail({'status.confirmed': true, 'status.declined': false, email: schoolRegex}, sender, title, text, callback);
            break;
        case 'confirmed and need transportation':
            sendMassMail({'status.confirmed': true, 'status.declined': false, 'confirmation.needsTransportation': true, email: schoolRegex}, sender, title, text, callback);
            break;
        default:
            // custom
            Mailer.sendMassMail(sender, title, text, recipient, callback);
    }
};

MailController.sendPostVerificationEmail = function (recipient, callback) {
    Mailer.sendPostVerificationEmail(recipient, callback);
};

module.exports = MailController;
