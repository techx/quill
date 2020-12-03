var mongoose = require("mongoose"),
  bcrypt = require("bcrypt"),
  validator = require("validator"),
  jwt = require("jsonwebtoken");
JWT_SECRET = process.env.JWT_SECRET;

var org = {
  type: {
    type: String,
    enum: {
      values: "STARTUP PRV PUB NGO".split(" "),
    }
  },

  name: {
    type: String,
    min: 0,
    max: 300,
  },

  no_of_employees: {
    type: String,
    enum: {
      values: "1_5 6_20 21_50 more_50".split(" "),
    }
  },

  funding_raised: {
    type: String,
    enum: {
      values: "BOOTSTRAPPED 0_50 50_100 more_100".split(" "),
    }
  },

  dpiit: {
    type: String,
    enum: {
      values: "YES NO".split(" "),
    }
  },

  address: {
    type: String,
    min: 0,
    max: 300,
  },

  sector: {
    type: String,
    min: 0,
    max: 300,
  },

  website: {
    type: String,
    min: 0,
    max: 300,
  },

  github: {
    type: String,
    min: 0,
    max: 300,
  },

  twitter: {
    type: String,
    min: 0,
    max: 300,
  },

  is_indian: {
    type: String,
    min: 0,
    max: 50,
  }
}

var profile = {
  // Basic info
  name: {
    type: String,
    min: 1,
    max: 100,
  },

  adult: {
    type: Boolean,
    required: true,
    default: false,
  },

  declaration: {
    type: Boolean,
    required: true,
    default: false,
  },

  school: {
    type: String,
    min: 1,
    max: 150,
  },

  past_school: {
    type: String,
    min: 1,
    max: 150,
  },

  field: {
    type: String,
    min: 1,
    max: 150,
  },

  nationality: {
    type: String,
    min: 1,
    max: 150,
  },

  graduationYear: {
    type: String,
    enum: {
      values: "2016 2017 2018 2019".split(" "),
    },
  },

  description: {
    type: String,
    min: 0,
    max: 300,
  },

  designation: {
    type: String,
    min: 0,
    max: 300,
  },

  essay: {
    type: String,
    min: 0,
    max: 1500,
  },

  // Optional info for demographics
  gender: {
    type: String,
    enum: {
      values: "M F T O N".split(" "),
    },
  },

  course: {
    type: String,
    enum: {
      values: "UG PG PHD PDOC RF PROF".split(" "),
    },
  },

  job_status: {
    type: String,
    enum: {
      values: "EMPLOYED UNEMPLOYED FREELANCER".split(" "),
    },
  },

  age: {
    type: Number,
    min: 18,
    max: 110,
  },

  category: {
    type: String,
    enum: {
      values: "STUD_PROF IND ORG".split(" "),
    },
  },

  org: org,
};

// Only after confirmed
var confirmation = {
  phoneNumber: String,
  dietaryRestrictions: [String],
  shirtSize: {
    type: String,
    enum: {
      values: "XS S M L XL XXL WXS WS WM WL WXL WXXL".split(" "),
    },
  },
  wantsHardware: Boolean,
  hardware: String,

  major: String,
  github: String,
  twitter: String,
  website: String,
  resume: String,

  needsReimbursement: Boolean,
  address: {
    name: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
  receipt: String,

  hostNeededFri: Boolean,
  hostNeededSat: Boolean,
  genderNeutral: Boolean,
  catFriendly: Boolean,
  smokingFriendly: Boolean,
  hostNotes: String,

  notes: String,

  signatureLiability: String,
  signaturePhotoRelease: String,
  signatureCodeOfConduct: String,
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
    validate: [validator.isEmail, "Invalid Email"],
    select: false,
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
    type: Number,
  },
  reimbursementGiven: {
    type: Boolean,
    default: false,
  },
  conceptNoteSubmitted_one: {
    type: Boolean,
    default: false,
  },
  conceptNoteSubmitted_two: {
    type: Boolean,
    default: false,
  },
  conceptNoteSubmitted_three: {
    type: Boolean,
    default: false,
  }

};

// define the schema for our admin model
var schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validator.isEmail, "Invalid Email"],
  },

  password: {
    type: String,
    required: true,
    select: false,
  },

  admin: {
    type: Boolean,
    required: true,
    default: false,
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

  teamAdmin: {
    type: String,
    min: 0,
    max: 140,
  },
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },

  salt: {
    type: Number,
    required: true,
    default: Date.now(),
    select: false,
  },

  /**
   * User Profile.
   *
   * This is the only part of the user that the user can edit.
   *
   * Profile validation will exist here.
   */
  profile: profile,

  // User theme
  subtheme_one: {
    name: {
      type: String,
      min: 1,
      max: 100,
    },
  },

  subtheme_two: {
    name: {
      type: String,
      min: 1,
      max: 100,
    },
  },

  subtheme_three: {
    name: {
      type: String,
      min: 1,
      max: 100,
    },
  },

  /**
   * Confirmation information
   *
   * Extension of the user model, but can only be edited after acceptance.
   */
  confirmation: confirmation,

  status: status,
});

schema.set("toJSON", {
  virtuals: true,
});

schema.set("toObject", {
  virtuals: true,
});

//=========================================
// Instance Methods
//=========================================

// checking if this password matches
schema.methods.checkPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// Token stuff
schema.methods.generateEmailVerificationToken = function () {
  return jwt.sign(this.email, JWT_SECRET);
};

schema.methods.generateAuthToken = function () {
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
schema.methods.generateTempAuthToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    JWT_SECRET,
    {
      expiresInMinutes: 60,
    }
  );
};

//=========================================
// Static Methods
//=========================================

schema.statics.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

/**
 * Verify an an email verification token.
 * @param  {[type]}   token token
 * @param  {Function} cb    args(err, email)
 */
schema.statics.verifyEmailVerificationToken = function (token, callback) {
  jwt.verify(token, JWT_SECRET, function (err, email) {
    return callback(err, email);
  });
};

/**
 * Verify a temporary authentication token.
 * @param  {[type]}   token    temporary auth token
 * @param  {Function} callback args(err, id)
 */
schema.statics.verifyTempAuthToken = function (token, callback) {
  jwt.verify(token, JWT_SECRET, function (err, payload) {
    if (err || !payload) {
      return callback(err);
    }

    if (!payload.exp || Date.now() >= payload.exp * 1000) {
      return callback({
        message: "Token has expired.",
      });
    }

    return callback(null, payload.id);
  });
};

schema.statics.findOneByEmail = function (email) {
  return this.findOne({
    email: email.toLowerCase(),
  });
};

/**
 * Get a single user using a signed token.
 * @param  {String}   token    User's authentication token.
 * @param  {Function} callback args(err, user)
 */
schema.statics.getByToken = function (token, callback) {
  jwt.verify(
    token,
    JWT_SECRET,
    function (err, id) {
      if (err) {
        return callback(err);
      }
      this.findOne({ _id: id }, callback);
    }.bind(this)
  );
};

schema.statics.validateProfile = function (profile, cb) {
  return cb(
    !(
      profile.name.length > 0 &&
      /* profile.adult && */
      /* profile.school.length > 0 && */
      /* profile.nationality.length > 0 && */
      profile.declaration == true
      /* ['2016', '2017', '2018', '2019'].indexOf(profile.graduationYear) > -1 && */
      /* ["UG", "PG", "PHD", "PDOC", "RF", "PROF"].indexOf(profile.course) > -1 &&
      ["M", "F", "T", "O", "N"].indexOf(profile.gender) > -1 */
    )
  );
};

//=========================================
// Virtuals
//=========================================

/**
 * Has the user completed their profile?
 * This provides a verbose explanation of their furthest state.
 */
schema.virtual("status.name").get(function () {
  if (this.status.checkedIn) {
    return "checked in";
  }

  if (this.status.declined) {
    return "declined";
  }

  if (this.status.confirmed) {
    return "registered";
  }

  if (this.status.admitted) {
    return "admitted";
  }

  if (this.status.completedProfile) {
    return "submitted";
  }

  if (!this.verified) {
    return "unverified";
  }

  if(this.status.conceptNoteSubmitted) {
    return 'concept note submitted';
  }

  return "incomplete";
});

module.exports = mongoose.model("User", schema);
