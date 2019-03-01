var mongoose = require('mongoose');

/**
 * Settings Schema!
 *
 * Fields with select: false are not public.
 * These can be retrieved in controller methods.
 *
 * @type {mongoose}
 */
var schema = new mongoose.Schema({
  status: String,
  timeOpen: {
    type: Number,
    default: Date.now()
  },
  timeClose: {
    type: Number,
    default: Date.now() + 31104000000 // Add a year from now.
  },
  timeCloseUSC: {
    type: Number,
    default: Date.now() + 31104000000 // Add a year from now.
  },
  timeConfirm: {
    type: Number,
    default: Date.now() + (2*31104000000) // Date of confirmation
  },
  whitelistedEmails: {
    type: [String],
    select: false,
    default: ['.edu'],
  },
  acceptanceText: {
    type: String
  },
  rejectionText: {
    type: String
  },
  waitlistText: {
    type: String
  },
  confirmationText: {
    type: String
  },
  allowMinors: {
    type: Boolean
  },
  reviewers: {
    type: Number,
    default: 3
  }
});

/**
 * Get the list of whitelisted emails.
 * Whitelist emails are by default not included in settings.
 * @param  {Function} callback args(err, emails)
 */
schema.statics.getWhitelistedEmails = function(callback){
  this
    .findOne({})
    .select('whitelistedEmails')
    .exec(function(err, settings){
      return callback(err, settings.whitelistedEmails);
    });
};

/**
 * Get the open and close time for registration.
 * @param  {Function} callback args(err, times : {timeOpen, timeClose, timeConfirm})
 */
schema.statics.getRegistrationTimes = function(callback){
  this
    .findOne({})
    .select('timeOpen timeClose timeConfirm')
    .exec(function(err, settings){
      callback(err, {
        timeOpen: settings.timeOpen,
        timeClose: settings.timeClose,
        timeCloseUSC: settings.timeCloseUSC,
        timeConfirm: settings.timeConfirm
      });
    });
};

schema.statics.getReviewers = function(callback){
  this.findOne({})
      .select('reviewers')
      .exec(function(err, settings){
        return callback(err, settings.reviewers);
      })
}

schema.statics.getPublicSettings = function(callback){
  this
    .findOne({})
    .exec(callback);
};

module.exports = mongoose.model('Settings', schema);
