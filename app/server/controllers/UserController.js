var _ = require('underscore');
var User = require('../models/User');
var Settings = require('../models/Settings');
var Mailer = require('../services/sendgrid_email');
var Stats = require('../services/stats');
// var Waiver = require('../services/waiver');

var validator = require('validator');
var moment = require('moment');

var UserController = {};

// Tests a string if it ends with target s
function endsWith(s, test){
  return test.indexOf(s, test.length - s.length) !== -1;
}

/**
 * Determine whether or not a user can register.
 * @param  {String}   email    Email of the user
 * @param  {Function} callback args(err, true, false)
 * @return {[type]}            [description]
 */
function canRegister(email, password, callback){

  if (!password || password.length < 6){
    return callback({ message: "Password must be 6 or more characters."}, false);
  }

  // Check if its within the registration window.
  Settings.getRegistrationTimes(function(err, times){
    if (err) {
      callback(err);
    }

    var now = Date.now();

    if (now < times.timeOpen){
      return callback({
        message: "Registration opens in " + moment(times.timeOpen).fromNow() + "!"
      });
    }

    if (now > times.timeClose){
      return callback({
        message: "Sorry, registration is closed."
      });
    }

    if (!validator.isEmail(email)) {
      return callback({
        message: 'Not a valid email.'
      });
    }

    return callback(null, true);
  });
}

/**
 * Login a user given a token
 * @param  {String}   token    auth token
 * @param  {Function} callback args(err, token, user)
 */
UserController.loginWithToken = function(token, callback){
  User.getByToken(token, function(err, user){
    return callback(err, token, user);
  });
};

/**
 * Login a user given an email and password.
 * @param  {String}   email    Email address
 * @param  {String}   password Password
 * @param  {Function} callback args(err, token, user)
 */
UserController.loginWithPassword = function(email, password, callback){

  if (!password || password.length === 0){
    return callback({
      message: 'Please enter a password'
    });
  }

  if (!validator.isEmail(email)){
    return callback({
      message: 'Invalid email'
    });
  }

  User
    .findOneByEmail(email)
    .select('+password')
    .exec(function(err, user){
      if (err) {
        return callback(err);
      }
      if (!user) {
        return callback({
          message: "We couldn't find you!"
        });
      }
      if (!user.checkPassword(password)) {
        return callback({
          message: "That's not the right password."
        });
      }

      // yo dope nice login here's a token for your troubles
      var token = user.generateAuthToken();

      var u = user.toJSON();

      delete u.password;

      return callback(null, token, u);
  });
};

/**
 * Create a new user given an email and a password.
 * @param  {String}   email    User's email.
 * @param  {String}   password [description]
 * @param  {Function} callback args(err, user)
 */
UserController.createUser = function(email, password, callback) {

  if (typeof email !== "string"){
    return callback({
      message: "Email must be a string."
    });
  }

  email = email.toLowerCase();

  // Check that there isn't a user with this email already.
  canRegister(email, password, function(err, valid){

    if (err || !valid){
      return callback(err);
    }

    var u = new User();
    u.email = email;
    u.password = User.generateHash(password);
    u.save(function(err){
      if (err){
        // Duplicate key error codes
        if (err.name === 'MongoError' && (err.code === 11000 || err.code === 11001)) {
          return callback({
            message: 'An account for this email already exists.'
          });
        }

        return callback(err);
      } else {
        // yay! success.
        var token = u.generateAuthToken();

        // Send over a verification email
        var verificationToken = u.generateEmailVerificationToken();
        Mailer.sendVerificationEmail(email, verificationToken);

        return callback(
          null,
          {
            token: token,
            user: u
          }
        );
      }

    });
  });
};

UserController.getByToken = function (token, callback) {
  User.getByToken(token, callback);
};

/**
 * Get all users.
 * It's going to be a lot of data, so make sure you want to do this.
 * @param  {Function} callback args(err, user)
 */
UserController.getAll = function (callback) {
  User.find({}, callback);
};

/**
 * Get a page of users.
 * @param  {[type]}   page     page number
 * @param  {[type]}   size     size of the page
 * @param  {Function} callback args(err, {users, page, totalPages})
 */
UserController.getPage = function(query, callback){
  var page = query.page;
  var size = parseInt(query.size);
  var searchText = query.text;

  var findQuery = {};
  if (searchText.length > 0){
    var queries = [];
    var re = new RegExp(searchText, 'i');
    queries.push({ email: re });
    queries.push({ 'profile.name': re });
    queries.push({ 'profile.school': re });

    findQuery.$or = queries;
  }

  User
    .find(findQuery)
    .sort({
      'profile.name': 'asc'
    })
    .select('+status.admittedBy')
    .skip(page * size)
    .limit(size)
    .exec(function (err, users){
      if (err || !users){
        return callback(err);
      }

      User.count(findQuery).exec(function(err, count){

        if (err){
          return callback(err);
        }

        return callback(null, {
          query: searchText,
          users: users,
          page: page,
          size: size,
          totalPages: Math.ceil(count / size)
        });
      });

    });
};

/**
 * Get a user by id.
 * @param  {String}   id       User id
 * @param  {Function} callback args(err, user)
 */
UserController.getById = function (id, callback){
  User.findById(id, callback);
};

/**
 * Update a user's profile object, given an id and a profile.
 *
 * @param  {String}   id       Id of the user
 * @param  {Object}   profile  Profile object
 * @param  {Function} callback Callback with args (err, user)
 */
UserController.updateProfileById = function (id, profile, callback){

  // Validate the user profile, and mark the user as profile completed
  // when successful.
  User.validateProfile(profile, function(err){

    if (err){
      return callback({message: 'invalid profile'});
    }

    // Check if its within the registration window.
    Settings.getRegistrationTimes(function(err, times){
      if (err) {
        callback(err);
      }

      var now = Date.now();

      if (now < times.timeOpen){
        return callback({
          message: "Registration opens in " + moment(times.timeOpen).fromNow() + "!"
        });
      }

      if (now > times.timeClose){
        return callback({
          message: "Sorry, registration is closed."
        });
      }
    });

    User.findOneAndUpdate({
      _id: id
    },
      {
        $set: {
          'lastUpdated': Date.now(),
          'profile': profile,
          'status.completedProfile': true
        }
      },
      {
        new: true
      },
      callback);

  });
};

/**
 * Update a user's confirmation object, given an id and a confirmation.
 *
 * @param  {String}   id            Id of the user
 * @param  {Object}   confirmation  Confirmation object
 * @param  {Function} callback      Callback with args (err, user)
 */
UserController.updateConfirmationById = function (id, confirmation, callback){

  User.findById(id, function(err, user){

    if(err || !user){
      return callback(err);
    }

    // Make sure that the user followed the deadline, but if they're already confirmed
    // that's okay.
    if (Date.now() >= user.status.confirmBy && !user.status.confirmed){
      return callback({
        message: "You've missed the confirmation deadline."
      });
    }

    // You can only confirm acceptance if you're admitted and haven't declined.
    User.findOneAndUpdate({
      '_id': id,
      'status.admitted': true,
      'status.declined': {$ne: true}
    },
      {
        $set: {
          'lastUpdated': Date.now(),
          'confirmation': confirmation,
          'status.confirmed': true,
        }
      }, {
        new: true
      }, function(err, user){
        if (!err && user && typeof user.confirmation.signatureLiability === 'undefined') {
          Mailer.sendWaiverEmail(user.email, (err, info) => {
            if (!err) {
              User.findOneAndUpdate({
                '_id': id
              },
              {
                $set: {
                  'lastUpdated': Date.now(),
                  'confirmation.signatureLiability': ''
                }
              }, {
                new: true
              },
              callback);
            } else {
              return callback(err, user);
            }
          });
        } else {
          return callback(err, user);
        }
      });

  });
};

/**
 * Decline an acceptance, given an id.
 *
 * @param  {String}   id            Id of the user
 * @param  {Function} callback      Callback with args (err, user)
 */
UserController.declineById = function (id, callback){

  // You can only decline if you've been accepted.
  User.findOneAndUpdate({
    '_id': id,
    'verified': true,
    'status.admitted': true,
    'status.declined': false
  },
    {
      $set: {
        'lastUpdated': Date.now(),
        'status.confirmed': false,
        'status.declined': true
      }
    }, {
      new: true
    },
    callback);
};

/**
 * Verify a user's email based on an email verification token.
 * @param  {[type]}   token    token
 * @param  {Function} callback args(err, user)
 */
UserController.verifyByToken = function(token, callback){
  User.verifyEmailVerificationToken(token, function(err, email){
    if (email) {
      User.findOneAndUpdate({
        email: email.toLowerCase()
      },{
        $set: {
          'verified': true
        }
      }, {
        new: true
      },
      callback);
    }
  });
};

/**
 * Resend an email verification email given a user id.
 */
UserController.sendVerificationEmailById = function(id, callback){
  User.findOne(
    {
      _id: id,
      verified: false
    },
    function(err, user){
      if (err || !user){
        return callback(err);
      }
      var token = user.generateEmailVerificationToken();
      Mailer.sendVerificationEmail(user.email, token);
      return callback(err, user);
  });
};

/**
 * Password reset email
 * @param  {[type]}   email    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
UserController.sendPasswordResetEmail = function(email, callback){
  User
    .findOneByEmail(email)
    .exec(function(err, user){
      if (err || !user){
        return callback(err);
      }

      var token = user.generateTempAuthToken();
      Mailer.sendPasswordResetEmail(email, user.profile.firstname, token, callback);
    });
};

/**
 * UNUSED
 *
 * Change a user's password, given their old password.
 * @param  {[type]}   id          User id
 * @param  {[type]}   oldPassword old password
 * @param  {[type]}   newPassword new password
 * @param  {Function} callback    args(err, user)
 */
UserController.changePassword = function(id, oldPassword, newPassword, callback){
  if (!id || !oldPassword || !newPassword){
    return callback({
      message: 'Bad arguments.'
    });
  }

  User
    .findById(id)
    .select('password')
    .exec(function(err, user){
      if (user.checkPassword(oldPassword)) {
        User.findOneAndUpdate({
          _id: id
        },{
          $set: {
            password: User.generateHash(newPassword)
          }
        }, {
          new: true
        },
        callback);
      } else {
        return callback({
          message: 'Incorrect password'
        });
      }
    });
};

/**
 * Reset a user's password to a given password, given a authentication token.
 * @param  {String}   token       Authentication token
 * @param  {String}   password    New Password
 * @param  {Function} callback    args(err, user)
 */
UserController.resetPassword = function(token, password, callback){
  if (!password || !token){
    return callback({
      message: 'Bad arguments'
    });
  }

  if (password.length < 6){
    return callback({
      message: 'Password must be 6 or more characters.'
    });
  }

  User.verifyTempAuthToken(token, function(err, id){

    if(err || !id){
      return callback(err);
    }

    User
      .findOneAndUpdate({
        _id: id
      },{
        $set: {
          password: User.generateHash(password)
        }
      }, function(err, user){
        if (err || !user){
          return callback(err);
        }

        Mailer.sendPasswordChangedEmail(user.email, user.profile.firstname);
        return callback(null, {
          message: 'Password successfully reset!'
        });
      });
  });
};

/**
 * [ADMIN ONLY]
 *
 * Admit a user.
 * @param  {String}   userId   User id of the admit
 * @param  {String}   user     User doing the admitting
 * @param  {Function} callback args(err, user)
 */
UserController.admitUser = function(id, user, callback){
  Settings.getRegistrationTimes(function(err, times){
    User
      .findOneAndUpdate({
        _id: id
      },{
        $set: {
          'status.admitted': true,
          'status.admittedBy': user.email,
          'status.confirmBy': times.timeConfirm
        }
      }, {
        new: true
      },
      callback);
  });
};

/**
 * [ADMIN ONLY]
 *
 * Admit a user.
 * @param  {String}   email    Email of the admit
 * @param  {String}   user     User doing the admitting
 * @param  {Function} callback args(err, user)
 */
UserController.admitUserByEmail = function(email, user, callback){
  Settings.getRegistrationTimes(function(err, times){
    User
      .findOneAndUpdate({
        email: email
      },{
        $set: {
          'status.admitted': true,
          'status.admittedBy': user.email,
          'status.confirmBy': times.timeConfirm
        }
      }, {
        new: true
      },
      callback);
  });
};

/**
 * [ADMIN ONLY]
 *
 * Check in a user.
 * @param  {String}   userId   User id of the user getting checked in.
 * @param  {String}   user     User checking in this person.
 * @param  {Function} callback args(err, user)
 */
UserController.checkInById = function(id, user, callback){
  User.findOneAndUpdate({
    _id: id
  },{
    $set: {
      'status.checkedIn': true,
      'status.checkInTime': Date.now()
    }
  }, {
    new: true
  },
  callback);
};

/**
 * [ADMIN ONLY]
 *
 * Check out a user.
 * @param  {String}   userId   User id of the user getting checked out.
 * @param  {String}   user     User checking in this person.
 * @param  {Function} callback args(err, user)
 */
UserController.checkOutById = function(id, user, callback){
  User.findOneAndUpdate({
    _id: id
  },{
    $set: {
      'status.checkedIn': false
    }
  }, {
    new: true
  },
  callback);
};


/**
 * [ADMIN ONLY]
 */
 /**
  * Send the acceptance email to the participant by their ID.
  * @param  {[type]}   ID    [description]
  * @param  {Function} callback [description]
  */
UserController.sendAcceptanceEmailById = function(id, callback) {
   User.findOne(
     {
       _id: id,
       verified: true
     },
     function(err, user) {
       if (err || !user) {
         return callback(err);
       }
       Mailer.sendAcceptanceEmail(user.email, user.status.confirmBy, callback);
       return callback(err, user);
   });
 };

 /**
 * [ADMIN ONLY]
 */
 /**
  * Send the acceptance email to the participant by their email.
  * @param  {[type]}   ID    [description]
  * @param  {Function} callback [description]
  */
UserController.sendAcceptanceEmailByEmail = function(email, callback) {
   email = email.toLowerCase();
   User.findOne(
     {
       email: email
     },
     function(err, user) {
       if (err || !user) {
         return callback(err || 'no user');
       }
       Mailer.sendAcceptanceEmail(email, user.status.confirmBy, callback);
   });
 };

UserController.markWaiverAsSigned = function(email, callback) {
  User.findOneAndUpdate({
    'email': email,
    'status.admitted': true
  },{
    $set: {
      'lastUpdated': Date.now(),
      'confirmation.signatureLiability': Date.now()
    }
  }, {
    new: true
  },
  callback);
};

UserController.sendWaiverEmail = function(id, callback) {
  User.findById(id, function(err, user){

    if(err || !user){
      return callback(err);
    }

    if (typeof user.confirmation.signatureLiability === 'undefined') {
      Mailer.sendWaiverEmail(user.email, (err, info) => {
        if (!err) {
          User.findOneAndUpdate({
            '_id': id
          },
          {
            $set: {
              'lastUpdated': Date.now(),
              'confirmation.signatureLiability': ''
            }
          }, {
            new: true
          },
          callback);
        } else {
          return callback(err);
        }
      });
    } else {
      Mailer.sendWaiverEmail(user.email, (err, info) => {
        return callback(err, info);
      });
    }

  });
};

UserController.getStats = function(callback){
  return callback(null, Stats.getUserStats());
};

UserController.addUserAcceptedQueue = function(id, callback){
  User.findOneAndUpdate({
    _id: id,
    'status.admitted': false,
    'status.declined': false,
    'status.completedProfile': true,
    'status.queued': null
  },{
    $set: {
      'status.queued': Date.now(),
    }
  },
  callback);
};

UserController.removeUserAcceptedQueue = function(id, callback){
  User.findOneAndUpdate({
    _id: id,
    'status.queued' : {$ne: null}
  },{
    $set: {
      'status.queued': null
    }
  },
  callback);
};

UserController.acceptAllInAcceptedQueue = function(admitterEmail, callback){
  User
  .find({
    'status.queued' : {$ne: null},
    'status.admitted' : false,
    'status.declined': false,
    'status.completedProfile': true
  })
  .exec(function (err, users){
    if (err || !users){
      return callback(err);
    }
    users.forEach(function(user){
      Mailer.sendAcceptanceEmail(user.email, user.status.confirmBy, function(err, data){
        if(err){
          return callback(err,{user});
        }
        user.status.admitted = true;
        user.status.admittedBy = admitterEmail;
        user.status.queued = null;
        user.markModified('status');
        user.save(function(err){
          if(err){
            return callback(err,{user});
          }
        });
      });
    });
    return callback(null, {users});
  });
};

UserController.viewAcceptedQueue = function(callback){
  User
  .find({
    'status.queued' : {$ne: null},
    'status.admitted' : false
  })
  .sort({
    'status.queued': 'asc'
  })
  .exec(function (err, users){
    if (err || !users){
      return callback(err);
    }
    queueStats = {
      gender: {},
      school: {},
      year: {}
    };
    users.forEach(function(user){
      if(user.profile.gender in queueStats.gender){
        queueStats.gender[user.profile.gender] += 1;
      } else {
        queueStats.gender[user.profile.gender] = 1;
      }
      if(user.profile.school in queueStats.school){
        queueStats.school[user.profile.school] += 1;
      } else {
        queueStats.school[user.profile.school] = 1;
      }
      if(user.profile.graduationYear in queueStats.year){
        queueStats.year[user.profile.graduationYear] += 1;
      } else {
        queueStats.year[user.profile.graduationYear] = 1;
      }
    });
    return callback(null, {
      users,
      stats: queueStats
    });
  });
};

module.exports = UserController;