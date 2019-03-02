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
    select: false,
    default: 3
  },
  reviewCriteria: {
    type: [String],
    select: false,
    default: ['Skill', 'Culture', 'Passion']
  },
  acceptances: {
    type: Number,
    select: false,
    default: 800
  },
  judges: {
    type: Number,
    select: false,
    default: 3
  },
  judgeCriteria: {
    type: [String],
    select: false,
    default: ['Entrepreneurship', 'Entertainment', 'Transportation', 'Technicality', 'Creativity', 'Impact']
  }
});

/**
 * Get the list of review criteria
 * Review criteria are by default not included in settings.
 * @param  {Function} callback args(err, reviewCriteria)
 */
schema.statics.getReview = function(callback){
  this
      .findOne({})
      .select('reviewers reviewCriteria acceptances')
      .exec(function(err, settings){
        return callback(err, settings);
      });
};

/**
 * Get the list of review criteria
 * Review criteria are by default not included in settings.
 * @param  {Function} callback args(err, reviewCriteria)
 */
schema.statics.getJudge = function(callback){
  this
      .findOne({})
      .select('judges judgeCriteria')
      .exec(function(err, settings){
        return callback(err, settings);
      });
};


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

schema.statics.getPublicSettings = function(callback){
  this
    .findOne({})
    .exec(callback);
};

module.exports = mongoose.model('Settings', schema);
