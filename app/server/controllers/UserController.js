const moment = require("moment");
const validator = require("validator");

const User = require("../models/User");
const Settings = require("../models/Settings");
const Mailer = require("../services/email");
const Stats = require("../services/stats");

const UserController = {};

const maxTeamSize = process.env.TEAM_MAX_SIZE || 4;

// Tests a string if it ends with target s
function endsWith(s, test) {
    return test.indexOf(s, test.length - s.length) !== -1;
}

/**
 * Determine whether or not a user can register.
 * @param  {String}   email    Email of the user
 * @param  {Function} callback args(err, true, false)
 * @return {[type]}            [description]
 */
function canRegister(email, password, callback) {
    if (!password || password.length < 6) {
        return callback({ message: "Password must be 6 or more characters." }, false);
    }

    // Check if its within the registration window.
    Settings.getRegistrationTimes((err, times) => {
        if (err) {
            callback(err);
        }

        const now = Date.now();

        if (now < times.timeOpen) {
            return callback({
                message: `Registration opens in ${moment(times.timeOpen).fromNow()}!`,
            });
        }

        if (now > times.timeClose) {
            return callback({
                message: "Sorry, registration is closed.",
            });
        }

        return callback(null, true);

        // // Check for emails.
        // Settings.getWhitelistedEmails((err, emails) => {
        //     if (err || !emails) {
        //         return callback(err);
        //     }
        //     for (let i = 0; i < emails.length; i++) {
        //         if (validator.isEmail(email) && endsWith(emails[i], email)) {
        //             return callback(null, true);
        //         }
        //     }
        //     return callback({
        //         message: "Not a valid educational email.",
        //     }, false);
        // });
    });
}

/**
 * Login a user given a token
 * @param  {String}   token    auth token
 * @param  {Function} callback args(err, token, user)
 */
UserController.loginWithToken = function (token, callback) {
    User.getByToken(token, (err, user) => callback(err, token, user));
};

/**
 * Login a user given an email and password.
 * @param  {String}   email    Email address
 * @param  {String}   password Password
 * @param  {Function} callback args(err, token, user)
 */
UserController.loginWithPassword = function (email, password, callback) {
    if (!password || password.length === 0) {
        return callback({
            message: "Please enter a password",
        });
    }

    if (!validator.isEmail(email)) {
        return callback({
            message: "Invalid email",
        });
    }

    User
        .findOneByEmail(email)
        .select("+password")
        .exec((err, user) => {
            if (err) {
                return callback(err);
            }
            if (!user) {
                return callback({
                    message: "We couldn't find you!",
                });
            }
            if (!user.checkPassword(password)) {
                return callback({
                    message: "That's not the right password.",
                });
            }

            // yo dope nice login here's a token for your troubles
            const token = user.generateAuthToken();

            const u = user.toJSON();

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
UserController.createUser = function (email, password, callback) {
    if (typeof email !== "string") {
        return callback({
            message: "Email must be a string.",
        });
    }

    email = email.toLowerCase();

    // Check that there isn't a user with this email already.
    canRegister(email, password, (err, valid) => {
        if (err || !valid) {
            return callback(err);
        }

        const u = new User();
        u.email = email;
        u.password = User.generateHash(password);
        u.save((err) => {
            if (err) {
                // Duplicate key error codes
                if (err.name === "MongoError" && (err.code === 11000 || err.code === 11001)) {
                    return callback({
                        message: "An account for this email already exists.",
                    });
                }

                return callback(err);
            }
            // yay! success.
            const token = u.generateAuthToken();

            // Send over a verification email
            const verificationToken = u.generateEmailVerificationToken();
            Mailer.sendVerificationEmail(email, verificationToken);

            return callback(
                null,
                {
                    token,
                    user: u,
                },
            );
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
UserController.getPage = function (query, callback) {
    const page = query.page;
    const size = parseInt(query.size);
    const searchText = query.text;

    const findQuery = {};
    if (searchText.length > 0) {
        const queries = [];
        const re = new RegExp(searchText, "i");
        queries.push({ email: re });
        queries.push({ "profile.name": re });
        queries.push({ teamCode: re });

        findQuery.$or = queries;
    }

    User
        .find(findQuery)
        .sort({
            "profile.name": "asc",
        })
        .select("+status.admittedBy")
        .skip(page * size)
        .limit(size)
        .exec((err, users) => {
            if (err || !users) {
                return callback(err);
            }

            User.count(findQuery).exec((err, count) => {
                if (err) {
                    return callback(err);
                }

                return callback(null, {
                    users,
                    page,
                    size,
                    totalPages: Math.ceil(count / size),
                });
            });
        });
};

/**
 * Get a user by id.
 * @param  {String}   id       User id
 * @param  {Function} callback args(err, user)
 */
UserController.getById = function (id, callback) {
    User.findById(id, callback);
};

/**
 * Update a user's profile object, given an id and a profile.
 *
 * @param  {String}   id       Id of the user
 * @param  {Object}   profile  Profile object
 * @param  {Function} callback Callback with args (err, user)
 */
UserController.updateProfileById = function (id, profile, callback) {
    // Validate the user profile, and mark the user as profile completed
    // when successful.
    User.validateProfile(profile, (err) => {
        if (err) {
            return callback({ message: "invalid profile" });
        }

        // Check if its within the registration window.
        Settings.getRegistrationTimes((err, times) => {
            if (err) {
                callback(err);
            }

            const now = Date.now();

            if (now < times.timeOpen) {
                return callback({
                    message: `Registration opens in ${moment(times.timeOpen).fromNow()}!`,
                });
            }

            if (now > times.timeClose) {
                return callback({
                    message: "Sorry, registration is closed.",
                });
            }
        });

        User.findOneAndUpdate({
            _id: id,
            verified: true,
        },
        {
            $set: {
                lastUpdated: Date.now(),
                profile,
                "status.completedProfile": true,
            },
        },
        {
            new: true,
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
UserController.updateConfirmationById = function (id, confirmation, confirmUser, callback) {
    User.findById(id, (err, user) => {
        if (err || !user) {
            return callback(err);
        }

        // Make sure that the user followed the deadline, but if they're already confirmed
        // that's okay.
        if (Date.now() >= user.status.confirmBy && !user.status.confirmed) {
            return callback({
                message: "You've missed the confirmation deadline.",
            });
        }

        // You can only confirm acceptance if you're admitted and haven't declined.
        User.findOneAndUpdate({
            _id: id,
            verified: true,
            "status.admitted": true,
            "status.declined": { $ne: true },
        },
        {
            $set: {
                lastUpdated: Date.now(),
                confirmation,
                "status.confirmed": confirmUser,
            },
        }, {
            new: true,
        },
        callback);
    });
};

/**
 * Decline an acceptance, given an id.
 *
 * @param  {String}   id            Id of the user
 * @param  {Function} callback      Callback with args (err, user)
 */
UserController.declineById = function (id, callback) {
    // You can only decline if you've been accepted.
    User.findOneAndUpdate({
        _id: id,
        verified: true,
        "status.admitted": true,
        "status.declined": false,
    },
    {
        $set: {
            lastUpdated: Date.now(),
            "status.confirmed": false,
            "status.declined": true,
        },
    }, {
        new: true,
    },
    callback);
};

/**
 * Verify a user's email based on an email verification token.
 * @param  {[type]}   token    token
 * @param  {Function} callback args(err, user)
 */
UserController.verifyByToken = function (token, callback) {
    User.verifyEmailVerificationToken(token, (err, email) => {
        User.findOneAndUpdate({
            email: email.toLowerCase(),
        }, {
            $set: {
                verified: true,
            },
        }, {
            new: true,
        },
        callback);
    });
};

/**
 * Get a specific user's teammates. NAMES ONLY.
 * @param  {String}   id       id of the user we're looking for.
 * @param  {Function} callback args(err, users)
 */
UserController.getTeammates = function (id, callback) {
    User.findById(id, (err, user) => {
        if (err || !user) {
            return callback(err, user);
        }

        const code = user.teamCode;

        if (!code) {
            return callback({
                message: "You're not on a team.",
            });
        }

        User
            .find({
                teamCode: code,
            })
            .select("profile.name")
            .exec(callback);
    });
};

/**
 * Given a team code and id, join a team.
 * @param  {String}   id       Id of the user joining/creating
 * @param  {String}   code     Code of the proposed team
 * @param  {Function} callback args(err, users)
 */
UserController.createOrJoinTeam = function (id, code, password, callback) {
    if (!code) {
        return callback({
            message: "Please enter a team name.",
        });
    }

    if (typeof code !== "string") {
        return callback({
            message: "Get outta here, punk!",
        });
    }

    // Validate password type and length
    if (isNaN(password) || password.length !== 4) {
        return callback({
            message: "Please enter a valid four digit password.",
        });
    }

    User.find({
        teamCode: code,
    })
        .select("profile.name teamPassword")
        .exec((err, users) => {
            // If there are any users, check if the password of this team matches the existing password
            if (users.length > 0 && parseInt(users[0].teamPassword) !== parseInt(password)) {
                return callback({
                    message: "Incorrect password specified to join this team.",
                });
            }

            // Check to see if this team is joinable (< team max size)
            if (users.length && users.length >= maxTeamSize) {
                return callback({
                    message: "Team is full.",
                });
            }

            // Otherwise, we can add that person to the team.
            User.findOneAndUpdate({
                _id: id,
                verified: true,
            }, {
                $set: {
                    teamCode: code,
                    teamPassword: password,
                },
            }, {
                new: true,
            },
            callback);
        });
};

/**
 * Given an id, remove them from any teams.
 * @param  {[type]}   id       Id of the user leaving
 * @param  {Function} callback args(err, user)
 */
UserController.leaveTeam = function (id, callback) {
    User.findOneAndUpdate({
        _id: id,
    }, {
        $set: {
            teamCode: null,
            teamPassword: null,
        },
    }, {
        new: true,
    },
    callback);
};

/**
 * Resend an email verification email given a user id.
 */
UserController.sendVerificationEmailById = function (id, callback) {
    User.findOne(
        {
            _id: id,
            verified: false,
        },
        (err, user) => {
            if (err || !user) {
                return callback(err);
            }
            const token = user.generateEmailVerificationToken();
            Mailer.sendVerificationEmail(user.email, token);
            return callback(err, user);
        },
    );
};

/**
 * Password reset email
 * @param  {[type]}   email    [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
UserController.sendPasswordResetEmail = function (email, callback) {
    User
        .findOneByEmail(email)
        .exec((err, user) => {
            if (err || !user) {
                return callback(err);
            }

            const token = user.generateTempAuthToken();
            Mailer.sendPasswordResetEmail(email, token, callback);
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
UserController.changePassword = function (id, oldPassword, newPassword, callback) {
    if (!id || !oldPassword || !newPassword) {
        return callback({
            message: "Bad arguments.",
        });
    }

    User
        .findById(id)
        .select("password")
        .exec((err, user) => {
            if (user.checkPassword(oldPassword)) {
                User.findOneAndUpdate({
                    _id: id,
                }, {
                    $set: {
                        password: User.generateHash(newPassword),
                    },
                }, {
                    new: true,
                },
                callback);
            }
            else {
                return callback({
                    message: "Incorrect password",
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
UserController.resetPassword = function (token, password, callback) {
    if (!password || !token) {
        return callback({
            message: "Bad arguments",
        });
    }

    if (password.length < 6) {
        return callback({
            message: "Password must be 6 or more characters.",
        });
    }

    User.verifyTempAuthToken(token, (err, id) => {
        if (err || !id) {
            return callback(err);
        }

        User
            .findOneAndUpdate({
                _id: id,
            }, {
                $set: {
                    password: User.generateHash(password),
                },
            }, (err, user) => {
                if (err || !user) {
                    return callback(err);
                }

                Mailer.sendPasswordChangedEmail(user.email);
                return callback(null, {
                    message: "Password successfully reset!",
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
UserController.admitUser = function (id, user, callback) {
    Settings.getRegistrationTimes((err, times) => {
        User
            .findOneAndUpdate({
                _id: id,
                verified: true,
            }, {
                $set: {
                    "status.admitted": true,
                    "status.admittedBy": user.email,
                    "status.confirmBy": times.timeConfirm,
                },
            }, {
                new: true,
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
UserController.checkInById = function (id, user, callback) {
    User.findOneAndUpdate({
        _id: id,
        verified: true,
    }, {
        $set: {
            "status.checkedIn": true,
            "status.checkInTime": Date.now(),
        },
    }, {
        new: true,
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
UserController.checkOutById = function (id, user, callback) {
    User.findOneAndUpdate({
        _id: id,
        verified: true,
    }, {
        $set: {
            "status.checkedIn": false,
        },
    }, {
        new: true,
    },
    callback);
};


/**
 * [ADMIN ONLY]
 */

UserController.getStats = function (callback) {
    return callback(null, Stats.getUserStats());
};

module.exports = UserController;
