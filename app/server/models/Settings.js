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
  timeOpenRegistration: {
    type: Number,
    default: 0
  },
  timeCloseRegistration: {
    type: Number,
    default: Date.now() + 31104000000 // Add a year from now.
  },
  timeConfirm: {
    type: Number,
    default: 604800000 // Date of confirmation
  },
  whitelistedEmails: {
    type: [String],
    select: false,
    default: ['.edu'],
  },
  companysWhitelistedEmails: {
    type: [String],
    select: false,
    default: ['.money'],
  },
  waitlistText: {
    type: String
  },
  acceptanceText: {
    type: String,
  },
  confirmationText: {
    type: String
  },
  allowMinors: {
    type: Boolean
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
 * Get the list of companys whitelisted emails.
 * Whitelist emails are by default not included in settings.
 * @param  {Function} callback args(err, emails)
 */
 schema.statics.getCompanysWhitelistedEmails = function(callback){
  this
    .findOne({})
    .select('companysWhitelistedEmails')
    .exec(function(err, settings){
      return callback(err, settings.companysWhitelistedEmails);
    });
};

/**
 * Get the open and close time for registration.
 * @param  {Function} callback args(err, times : {timeOpenRegistration, timeCloseRegistration, timeConfirm})
 */
schema.statics.getRegistrationTimes = function(callback){
  this
    .findOne({})
    .select('timeOpenRegistration timeCloseRegistration timeConfirm')
    .exec(function(err, settings){
      callback(err, {
        timeOpenRegistration: settings.timeOpenRegistration,
        timeCloseRegistration: settings.timeCloseRegistration,
        timeConfirm: settings.timeConfirm
      });
    });
};

schema.statics.getPublicSettings = function(callback){
  this
    .findOne({})
    .exec(callback);
};

module.exports = mongoose.model('Settings', schema);
