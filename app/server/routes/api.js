const asyncEach = require("async/each");
const asyncMap = require("async/map");
const flat = require("flat");
const papaparse = require("papaparse");
const request = require("request");
const UserModel = require("../models/User");
const UserController = require("../controllers/UserController");
const SettingsController = require("../controllers/SettingsController");

module.exports = function (router) {
    function getToken(req) {
        return req.headers["x-access-token"];
    }

    /**
   * Using the access token provided, check to make sure that
   * you are, indeed, an admin.
   */
    function isAdmin(req, res, next) {
        const token = getToken(req);

        UserController.getByToken(token, (err, user) => {
            if (err) {
                return res.status(500).send(err);
            }

            if (user && user.admin) {
                req.user = user;
                return next();
            }

            return res.status(401).send({
                message: "Get outta here, punk!",
            });
        });
    }

    /**
   * [Users API Only]
   *
   * Check that the id param matches the id encoded in the
   * access token provided.
   *
   * That, or you're the admin, so you can do whatever you
   * want I suppose!
   */
    function isOwnerOrAdmin(req, res, next) {
        const token = getToken(req);
        const userId = req.params.id;

        UserController.getByToken(token, (err, user) => {
            if (err || !user) {
                return res.status(500).send(err);
            }

            let tokenizedUserId;
            if (typeof user === "object" && user._id.toString) {
                tokenizedUserId = user._id.toString();
            }
            else if (typeof user._id === "string") {
                tokenizedUserId = user._id;
            }

            if (tokenizedUserId === userId || user.admin) {
                return next();
            }
            else {
                return res.status(400).send({
                    message: "Token does not match user id.",
                });
            }
        });
    }

    /**
   * Default response to send an error and the data.
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
    function defaultResponse(req, res) {
        return function (err, data) {
            if (err) {
                // SLACK ALERT!
                if (process.env.NODE_ENV === "production") {
                    request
                        .post(process.env.SLACK_HOOK,
                            {
                                form: {
                                    payload: JSON.stringify({
                                        text:
                    `${"``` \n"
                    + "Request: \n "}${
                        req.method} ${req.url
                    }\n ------------------------------------ \n`
                    + `Body: \n ${
                        JSON.stringify(req.body, null, 2)
                    }\n ------------------------------------ \n`
                    + `\nError:\n${
                        JSON.stringify(err, null, 2)
                    }\`\`\` \n`,
                                    }),
                                },
                            },
                            (error, response, body) => res.status(500).send({
                                message: "Your error has been recorded, we'll get right on it!",
                            }));
                }
                else {
                    return res.status(500).send(err);
                }
            }
            else {
                return res.json(data);
            }
        };
    }

    /**
   *  API!
   */

    // ---------------------------------------------
    // Users
    // ---------------------------------------------

    /**
   * [ADMIN ONLY]
   *
   * GET - Get all users, or a page at a time.
   * ex. Paginate with ?page=0&size=100
   */
    router.get("/users", isAdmin, (req, res) => {
        const query = req.query;

        if (query.page && query.size) {
            UserController.getPage(query, defaultResponse(req, res));
        }
        else {
            UserController.getAll(defaultResponse(req, res));
        }
    });

    /**
   * [ADMIN ONLY]
   */
    router.get("/users/stats", isAdmin, (req, res) => {
        UserController.getStats(defaultResponse(req, res));
    });

    /**
   * [OWNER/ADMIN]
   *
   * GET - Get a specific user.
   */
    router.get("/users/:id", isOwnerOrAdmin, (req, res) => {
        UserController.getById(req.params.id, defaultResponse(req, res));
    });

    /**
   * [OWNER/ADMIN]
   *
   * PUT - Update a specific user's profile.
   */
    router.put("/users/:id/profile", isOwnerOrAdmin, (req, res) => {
        const profile = req.body.profile;
        const id = req.params.id;

        UserController.updateProfileById(id, profile, defaultResponse(req, res));
    });

    /**
   * [OWNER/ADMIN]
   *
   * PUT - Update a specific user's confirmation information.
   */
    router.put("/users/:id/confirm", isOwnerOrAdmin, (req, res) => {
        const {
            confirmation,
            confirmUser,
        } = req.body;
        const id = req.params.id;

        UserController.updateConfirmationById(id, confirmation, confirmUser, defaultResponse(req, res));
    });

    /**
   * [OWNER/ADMIN]
   *
   * POST - Decline an acceptance.
   */
    router.post("/users/:id/decline", isOwnerOrAdmin, (req, res) => {
        const confirmation = req.body.confirmation;
        const id = req.params.id;

        UserController.declineById(id, defaultResponse(req, res));
    });

    /**
   * Get a user's team member's names. Uses the code associated
   * with the user making the request.
   */
    router.get("/users/:id/team", isOwnerOrAdmin, (req, res) => {
        const id = req.params.id;
        UserController.getTeammates(id, defaultResponse(req, res));
    });

    /**
   * Update a teamcode. Join/Create a team here.
   * {
   *   code: STRING
   * }
   */
    router.put("/users/:id/team", isOwnerOrAdmin, (req, res) => {
        const {
            body: {
                code,
                password,
            },
            params: {
                id,
            },
        } = req;

        UserController.createOrJoinTeam(id, code, password, defaultResponse(req, res));
    });

    /**
   * Remove a user from a team.
   */
    router.delete("/users/:id/team", isOwnerOrAdmin, (req, res) => {
        const id = req.params.id;

        UserController.leaveTeam(id, defaultResponse(req, res));
    });

    /**
   * Update a user's password.
   * {
   *   oldPassword: STRING,
   *   newPassword: STRING
   * }
   */
    router.put("/users/:id/password", isOwnerOrAdmin, (req, res) => res.status(304).send(),
    // Currently disable.
    // var id = req.params.id;
    // var old = req.body.oldPassword;
    // var pass = req.body.newPassword;

    // UserController.changePassword(id, old, pass, function(err, user){
    //   if (err || !user){
    //     return res.status(400).send(err);
    //   }
    //   return res.json(user);
    // });
    );

    /**
   * Admit a user. ADMIN ONLY, DUH
   *
   * Also attaches the user who did the admitting, for liabaility.
   */
    router.post("/users/:id/admit", isAdmin, (req, res) => {
    // Accept the hacker. Admin only
        const id = req.params.id;
        const user = req.user;
        UserController.admitUser(id, user, defaultResponse(req, res));
    });

    /**
   * Admit a user and their teammates. ADMIN ONLY, DUH
   */
    router.post("/users/:id/admitTeam", isAdmin, (req, res) => {
        const id = req.params.id;
        const user = req.user;
        UserController.getTeammates(id, (err, results) => {
            if (!err) {
                asyncEach(results, (teamMember, asyncCB) => {
                    UserController.admitUser(teamMember.id, user, asyncCB);
                }, defaultResponse(req, res));
            }
            else {
                return res.status(500).send({ err });
            }
        });
    });

    /**
   * Check in a user. ADMIN ONLY, DUH
   */
    router.post("/users/:id/checkin", isAdmin, (req, res) => {
        const id = req.params.id;
        const user = req.user;
        UserController.checkInById(id, user, defaultResponse(req, res));
    });

    /**
   * Check in a user. ADMIN ONLY, DUH
   */
    router.post("/users/:id/checkout", isAdmin, (req, res) => {
        const id = req.params.id;
        const user = req.user;
        UserController.checkOutById(id, user, defaultResponse(req, res));
    });


    // ---------------------------------------------
    // Settings [ADMIN ONLY!]
    // ---------------------------------------------

    /**
   * Get the public settings.
   * res: {
   *   timeOpen: Number,
   *   timeClose: Number,
   *   timeToConfirm: Number,
   *   acceptanceText: String,
   *   confirmationText: String,
   *   allowMinors: Boolean
   * }
   */
    router.get("/settings", (req, res) => {
        SettingsController.getPublicSettings(defaultResponse(req, res));
    });

    /**
   * Update the acceptance text.
   * body: {
   *   text: String
   * }
   */
    router.put("/settings/waitlist", isAdmin, (req, res) => {
        const text = req.body.text;
        SettingsController.updateField("waitlistText", text, defaultResponse(req, res));
    });

    /**
   * Update the acceptance text.
   * body: {
   *   text: String
   * }
   */
    router.put("/settings/acceptance", isAdmin, (req, res) => {
        const text = req.body.text;
        SettingsController.updateField("acceptanceText", text, defaultResponse(req, res));
    });

    /**
   * Update the confirmation text.
   * body: {
   *   text: String
   * }
   */
    router.put("/settings/confirmation", isAdmin, (req, res) => {
        const text = req.body.text;
        SettingsController.updateField("confirmationText", text, defaultResponse(req, res));
    });

    /**
   * Update the confirmation date.
   * body: {
   *   time: Number
   * }
   */
    router.put("/settings/confirm-by", isAdmin, (req, res) => {
        const time = req.body.time;
        SettingsController.updateField("timeConfirm", time, defaultResponse(req, res));
    });

    /**
   * Set the registration open and close times.
   * body : {
   *   timeOpen: Number,
   *   timeClose: Number
   * }
   */
    router.put("/settings/times", isAdmin, (req, res) => {
        const open = req.body.timeOpen;
        const close = req.body.timeClose;
        SettingsController.updateRegistrationTimes(open, close, defaultResponse(req, res));
    });

    /**
    * Get the whitelisted emails.
    *
    * res: {
    *   emails: [String]
    * }
    */
    router.get("/settings/whitelist", isAdmin, (req, res) => {
        SettingsController.getWhitelistedEmails(defaultResponse(req, res));
    });

    /**
   * [ADMIN ONLY]
   * {
   *   emails: [String]
   * }
   * res: Settings
   *
   */
    router.put("/settings/whitelist", isAdmin, (req, res) => {
        const emails = req.body.emails;
        SettingsController.updateWhitelistedEmails(emails, defaultResponse(req, res));
    });

    /**
   * [ADMIN ONLY]
   * {
   *   allowMinors: Boolean
   * }
   * res: Settings
   *
   */
    router.put("/settings/minors", isAdmin, (req, res) => {
        const allowMinors = req.body.allowMinors;
        SettingsController.updateField("allowMinors", allowMinors, defaultResponse(req, res));
    });

    router.get("/csv", isAdmin, (req, res) => {
        UserModel.find({
            "profile.name": {
                $exists: true,
                $ne: null,
            },
            "status.checkInTime": {
                $exists: true,
            },
        }).lean().exec((err, users) => {
            asyncMap(users, (user, cb) => {
                user._id._bsontype = undefined;
                user._id.id = undefined;
                const flattenedUser = flat(user);
                return cb(null, flattenedUser);
            }, (err, parsedUsers) => {
                const content = papaparse.unparse({
                    data: parsedUsers,
                    fields: Object.keys(parsedUsers[0]),
                }, {
                    delimiter: ",",
                });
                return res.end(content);
            });
        });
    });
};
