var _         = require('underscore');
var jwt       = require('jsonwebtoken');
var validator = require('validator');

var SettingsController = require('../controllers/SettingsController');
var UserController = require('../controllers/UserController');

module.exports = function(router){

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
  router.post('/login',
    function(req, res, next){
      var email = req.body.email;
      var password = req.body.password;
      var token = req.body.token;

      if (token) {
        UserController.loginWithToken(token,
          function(err, token, user){
            if (err || !user) {
              return res.status(400).send(err);
            }
            return res.json({
              token: token,
              user: user
            });
          });
      } else {
        UserController.loginWithPassword(email, password,
          function(err, token, user){
            if (err || !user) {
              return res.status(400).send(err);
            }
            return res.json({
              token: token,
              user: user
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
  router.post('/register',
    function(req, res, next){
      // Register with an email and password
      var email = req.body.email;
      var password = req.body.password;

      UserController.createUser(email, password,
        function(err, user){
          if (err){
            return res.status(400).send(err);
          }
          return res.json(user);
      });
  });

  router.post('/reset',
    function(req, res, next){
      var email = req.body.email;
      if (!email){
        return res.status(400).send();
      }

      UserController.sendPasswordResetEmail(email, function(err){
        if(err){
          return res.status(400).send(err);
        }
        return res.json({
          message: 'Email Sent'
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
  router.post('/reset/password', function(req, res){
    var pass = req.body.password;
    var token = req.body.token;

    UserController.resetPassword(token, pass, function(err, user){
      if (err || !user){
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
  router.post('/verify/resend',
    function(req, res, next){
      var id = req.body.id;
      if (id){
        UserController.sendVerificationEmailById(id, function(err, user){
          if (err || !user){
            return res.status(400).send();
          }
          return res.status(200).send();
        });
      } else {
        return res.status(400).send();
      }
  });

  /**
   * Verify a user with a given token.
   */
   router.get('/verify/:token',
    function(req, res, next){
      var token = req.params.token;
      UserController.verifyByToken(token, function(err, user){

        if (err || !user){
          return res.status(400).send(err);
        }

        return res.json(user);

      });
    });


   /**
    * Handle single-sign on logic.
    */
    router.post('/sso',
      function(req, res, next){
        // TODO(revalo): Check if url is a whitelisted url.

        // Check if the redirectURL is valid and secure.
        if (req.body.redirectURL == null ||
            !req.body.redirectURL.startsWith('https:')) {
          return res.status(400).send('Looks like your SSO app made an error.');
        }

        UserController.loginWithToken(req.body.token, function(err, token, user){

          if (err || !user){
            return res.status(400).send(err);
          }

          // We can't single sign on unverified users.
          if (!user.verified && !user.admin) res.status(400).send('You need to verify your email.');
          
          // At this point, user is valid. Let's construct and sign an SSO
          // token to be used by the other app.
          ssoToken = jwt.sign({
            id: user._id
          }, process.env.SSO_SECRET, {
            expiresIn: 30
          });

          return res.json({
            'redirectURL': req.body.redirectURL + '?token=' + ssoToken
          });
  
        });
    });

   /**
    * Exchange an SSO token for user information.
    */
    router.post('/sso/exchange',
      function(req, res, next){
        var token = req.body.token;
        var payload;

        try {
          payload = jwt.verify(token, process.env.SSO_SECRET);
        } catch(err) {
          return res.status(400).send('Invalid SSO Token.')
        }

        // SSO Token is valid, let's fetch user information.
        var id = payload.id;
        UserController.getById(id, function(err, data) {
          res.json(data);
        });
    });

};