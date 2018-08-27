const UserController = require("../controllers/UserController");

module.exports = function (router) {
    // ---------------------------------------------
    // AUTHENTICATION
    // ---------------------------------------------

    /**
   * Login a user with a username (email) and password.
   * Find em', check em'.
   * Pass them an authentication token on success.
   * Otherwise, 401. You fucked up.
   *
   * body {
   *  email: email,
   *  password: password
   *  token: ?
   * }
   *
   */
    router.post("/login", (req, res, next) => {
        const {
            email, password, token,
        } = req.body;

        if (token) {
            UserController.loginWithToken(token,
                (err, token, user) => {
                    if (err || !user) {
                        return res.status(400).send(err);
                    }
                    return res.json({
                        token,
                        user,
                    });
                });
        }
        else {
            UserController.loginWithPassword(email, password, (err, token, user) => {
                if (err || !user) {
                    return res.status(400).send(err);
                }
                return res.json({
                    token,
                    user,
                });
            });
        }
    });

    /**
   * Register a user with a username (email) and password.
   * If it already exists, then don't register, duh.
   *
   * body {
   *  email: email,
   *  password: password
   * }
   *
   */
    router.post("/register", (req, res, next) => {
        // Register with an email and password
        const {
            email, password,
        } = req.body;
        UserController.createUser(email, password, (err, user) => {
            if (err) {
                return res.status(400).send(err);
            }
            return res.json(user);
        });
    });

    router.post("/reset", (req, res, next) => {
        const email = req.body.email;
        if (!email) {
            return res.status(400).send();
        }

        UserController.sendPasswordResetEmail(email, (err) => {
            if (err) {
                return res.status(400).send(err);
            }
            return res.json({
                message: "Email Sent",
            });
        });
    });

    /**
   * Reset user's password.
   * {
   *   token: STRING
   *   password: STRING,
   * }
   */
    router.post("/reset/password", (req, res) => {
        const pass = req.body.password;
        const token = req.body.token;

        UserController.resetPassword(token, pass, (err, user) => {
            if (err || !user) {
                return res.status(400).send(err);
            }
            return res.json(user);
        });
    });

    /**
   * Resend a password verification email for this user.
   *
   * body {
   *   id: user id
   * }
   */
    router.post("/verify/resend", (req, res, next) => {
        const id = req.body.id;
        if (id) {
            UserController.sendVerificationEmailById(id, (err, user) => {
                if (err || !user) {
                    return res.status(400).send(err);
                }
                return res.status(200).send();
            });
        }
        else {
            return res.status(400).send();
        }
    });

    /**
   * Verify a user with a given token.
   */
    router.get("/verify/:token", (req, res, next) => {
        const token = req.params.token;
        UserController.verifyByToken(token, (err, user) => {
            if (err || !user) {
                return res.status(400).send(err);
            }

            return res.json(user);
        });
    });
};
