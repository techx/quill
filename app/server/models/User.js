var mongoose   = require('mongoose'),
    bcrypt     = require('bcrypt'),
    validator  = require('validator'),
    jwt        = require('jsonwebtoken');
    JWT_SECRET = process.env.JWT_SECRET;

var profile = {
  // Basic info
  name: {
    type: String,
    min: 1,
    max: 100,
  },
  firstName: {
    type: String,
    min: 1,
    max: 100,
  },
  lastName: {
    type: String,
    min: 1,
    max: 100,
  },
  phoneNumber: String,
  birthday: String,
  adult: {
    type: Boolean,
    required: true,
    default: false,
  },
  // Optional info for demographics
  gender: {
    type: String,
    enum : {
      values: 'M F O N'.split(' ')
    }
  },
  otherGender: String,
  race: {
    type: String,
    enum : {
      values: 'I A B H W O N'.split(' ')
    }
  },
  otherRace: String,
  school: {
    type: String,
    min: 1,
    max: 150,
  },
  major: String,
  standing: {
    type: String,
    enum : {
      values: 'F P J S M D'.split(' ')
    }
  },
  graduationTime: {
    type: String,
    enum: {
      values: [
        'Fall 2019', 
        'Spring 2020',
        'Fall 2020',
        'Spring 2021',
        'Fall 2021',
        'Spring 2022',
        'Fall 2022',
        'Spring 2023',
        'Other'
      ]
    }
  },
  resume: Boolean,
  skills: [String],
  firstHackathon: String,
  numHackathons: Number,
  socialMedia: [String],
  reimbursement: {
    type: String,
    enum : {
        values: 'O I N'.split(' ')
    }
  },
  essay: {
    type: String,
    min: 0,
    max: 1500
  },
  description: {
    type: String,
    min: 0,
    max: 300,
  }
};

var sponsorFields = {
    sponsorStatus: {
        type:String, 
        enum : {
            values: ['incomplete', 'completedProfile', 'grantedResumeAccess']
	    }
    },
    companyName: String,
    sponsorshipTier: {
        type: String,
        enum: {
            values: ['Kilo', 'Mega', 'Giga'] // Double check these!
        }
    },
    pledgeAmount: Number
}

// Only after confirmed
var confirmation = {
  dietaryRestrictions: [String],
  shirtSize: {
    type: String,
    enum: {
      values: 'XS S M L XL XXL WXS WS WM WL WXL WXXL'.split(' ')
    }
  },
  wantsHardware: Boolean,
  hardware: String,

  github: String,
  twitter: String,
  linkedin: String,
  website: String,

  contactName: String,
  contactPhone: String,
  contactRelationship: String,

  platforms: [String],
  workshops: String,
  help: String,
  notes: String,

  signatureLiability: String,
  signaturePhotoRelease: String,
  signatureCodeOfConduct: String,
  signatureAffliationMlh: String
};

var status = {
  /**
   * Whether or not the user's profile has been completed.
   * @type {Object}
   */
  completedProfile: {
    type: Boolean,
    required: true,
    default: false,
  },
  admitted: {
    type: Boolean,
    required: true,
    default: false,
  },
  admittedBy: {
    type: String,
    validate: [
      validator.isEmail,
      'Invalid Email',
    ],
    select: false
  },
  confirmed: {
    type: Boolean,
    required: true,
    default: false,
  },
  declined: {
    type: Boolean,
    required: true,
    default: false,
  },
  checkedIn: {
    type: Boolean,
    required: true,
    default: false,
  },
  checkInTime: {
    type: Number,
  },
  confirmBy: {
    type: Number
  },
  reimbursementGiven: {
    type: Boolean,
    default: false
  }
};

// define the schema for our admin model
var schema = new mongoose.Schema({

  email: {
      type: String,
      required: true,
      unique: true,
      validate: [
        validator.isEmail,
        'Invalid Email',
      ]
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  admin: {
    type: Boolean,
    required: true,
    default: false,
  },

  sponsor: {
    type: Boolean,
    required: true,
    default: false
  },

  timestamp: {
    type: Number,
    required: true,
    default: Date.now(),
  },

  lastUpdated: {
    type: Number,
    default: Date.now(),
  },

  teamCode: {
    type: String,
    min: 0,
    max: 140,
  },

  verified: {
    type: Boolean,
    required: true,
    default: false
  },

  salt: {
    type: Number,
    required: true,
    default: Date.now(),
    select: false
  },

  /**
   * User Profile.
   *
   * This is the only part of the user that the user can edit.
   *
   * Profile validation will exist here.
   */
  profile: profile,

  /**
   * Confirmation information
   *
   * Extension of the user model, but can only be edited after acceptance.
   */
  confirmation: confirmation,

  status: status,

  sponsorFields: sponsorFields

});

schema.set('toJSON', {
  virtuals: true
});

schema.set('toObject', {
  virtuals: true
});

//=========================================
// Instance Methods
//=========================================

// checking if this password matches
schema.methods.checkPassword = function(password) {
  return bcrypt.compareSync(password, this.password.trim());
};

// Token stuff
schema.methods.generateEmailVerificationToken = function(){
  return jwt.sign(this.email, JWT_SECRET);
};

schema.methods.generateAuthToken = function(){
  return jwt.sign(this._id, JWT_SECRET);
};

/**
 * Generate a temporary authentication token (for changing passwords)
 * @return JWT
 * payload: {
 *   id: userId
 *   iat: issued at ms
 *   exp: expiration ms
 * }
 */
schema.methods.generateTempAuthToken = function(){
  return jwt.sign({
    id: this._id
  }, JWT_SECRET, {
    expiresInMinutes: 60,
  });
};

//=========================================
// Static Methods
//=========================================

schema.statics.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

/**
 * Verify an an email verification token.
 * @param  {[type]}   token token
 * @param  {Function} cb    args(err, email)
 */
schema.statics.verifyEmailVerificationToken = function(token, callback){
  jwt.verify(token, JWT_SECRET, function(err, email) {
    return callback(err, email);
  });
};

/**
 * Verify a temporary authentication token.
 * @param  {[type]}   token    temporary auth token
 * @param  {Function} callback args(err, id)
 */
schema.statics.verifyTempAuthToken = function(token, callback){
  jwt.verify(token, JWT_SECRET, function(err, payload){

    if (err || !payload){
      return callback(err);
    }

    if (!payload.exp || Date.now() >= payload.exp * 1000){
      return callback({
        message: 'Token has expired.'
      });
    }

    return callback(null, payload.id);
  });
};

schema.statics.findOneByEmail = function(email){
  return this.findOne({
    email: email.toLowerCase()
  });
};

/**
 * Get a single user using a signed token.
 * @param  {String}   token    User's authentication token.
 * @param  {Function} callback args(err, user)
 */
schema.statics.getByToken = function(token, callback){
  jwt.verify(token, JWT_SECRET, function(err, id){
    if (err) {
      return callback(err);
    }
    this.findOne({_id: id}, callback);
  }.bind(this));
};

schema.statics.validateProfile = function(profile, cb){
  return cb(!(
    profile.name.length > 0 &&
    profile.firstName.length > 0 &&
    profile.lastName.length > 0 &&
    profile.resume &&
    profile.adult &&
    profile.school.length > 0 &&
    [
        'Fall 2019', 
        'Spring 2020',
        'Fall 2020',
        'Spring 2021',
        'Fall 2021',
        'Spring 2022',
        'Fall 2022',
        'Spring 2023',
        'Other'
    ].indexOf(profile.graduationTime) > -1 &&
    ['M', 'F', 'O', 'N'].indexOf(profile.gender) > -1
    ));
};

//=========================================
// Virtuals
//=========================================

/**
 * Has the user completed their profile?
 * This provides a verbose explanation of their furthest state.
 */
schema.virtual('status.name').get(function(){

  if (this.status.checkedIn) {
    return 'checked in';
  }

  if (this.status.declined) {
    return "declined";
  }

  if (this.status.confirmed) {
    return "confirmed";
  }

  if (this.status.admitted) {
    return "admitted";
  }

  if (this.status.completedProfile){
    return "submitted";
  }

  if (!this.verified){
    return "unverified";
  }

  return "incomplete";

});

module.exports = mongoose.model('User', schema);
