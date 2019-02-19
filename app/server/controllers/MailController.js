var User = require('../models/User');
var Mailer = require('../services/email');

var MailController = {};

MailController.send = function (sender, title, text, recipient, callback) {
    var recipients = [];
    // filer recipient
    switch (recipient) {
        case 'verified':
            User.find({
                    verified: true,
                },
                'email',
                (err, res) => {
                    if (err) {
                        callback(err);
                        return;
                    }
                    recipients = res.map(doc => doc.email);
                    Mailer.sendMassMail(sender, title, text, recipients, callback);
                });
            break;
        case 'submitted':
            User.find({
                    'status.submitted': true,
                },
                'email',
                (err, res) => {
                    if (err) {
                        callback(err);
                        return;
                    }
                    recipients = res.map(doc => doc.email);
                    Mailer.sendMassMail(sender, title, text, recipients, callback);
                });
            break;
        case 'admitted':
            User.find({
                    'status.admitted': true,
                },
                'email',
                (err, res) => {
                    if (err) {
                        callback(err);
                        return;
                    }
                    recipients = res.map(doc => doc.email);
                    Mailer.sendMassMail(sender, title, text, recipients, callback);
                });
            break;
        case 'rejected':
            User.find({
                    'status.rejected': true,
                },
                'email',
                (err, res) => {
                    if (err) {
                        callback(err);
                        return;
                    }
                    recipients = res.map(doc => doc.email);
                    Mailer.sendMassMail(sender, title, text, recipients, callback);
                });
            break;
        case 'waitlisted':
            User.find({
                    'status.waitlisted': true,
                },
                'email',
                (err, res) => {
                    if (err) {
                        callback(err);
                        return;
                    }
                    recipients = res.map(doc => doc.email);
                    Mailer.sendMassMail(sender, title, text, recipients, callback);
                });
            break;
        case 'confirmed':
            User.find({
                    'status.confirmed': true,
                },
                'email',
                (err, res) => {
                    if (err) {
                        callback(err);
                        return;
                    }
                    recipients = res.map(doc => doc.email);
                    Mailer.sendMassMail(sender, title, text, recipients, callback)
                });
            break;
        default:
            // custom, separate by email
            recipients = recipient.split(',');
            if(recipients)
            Mailer.sendMassMail(sender, title, text, recipients, callback);
            break;
    }
};

module.exports = MailController;
