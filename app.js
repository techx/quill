// Load the dotfiles.
require('dotenv').load({silent: true});

var express         = require('express');

// Middleware!
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var morgan          = require('morgan');

var mongoose        = require('mongoose');
var port            = process.env.PORT || 3000;
var database        = process.env.DATABASE || process.env.MONGODB_URI || "mongodb://localhost:27017";

var settingsConfig  = require('./config/settings');
var adminConfig     = require('./config/admin');

var app             = express();

// Enforce HTTPS on production
if (process.env.NODE_ENV === 'production') {
  var enforce         = require('express-sslify');
  app.use(enforce.HTTPS({ trustProtoHeader: true }));
}

// Connect to mongodb
mongoose.connect(database, {useNewUrlParser: true});

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({
  extended: true,
  limit: '1mb'
}));
app.use(bodyParser.json({
  limit: '1mb'
}));


app.use(methodOverride());

app.use(express.static(__dirname + '/app/client'));

// Routers =====================================================================

var apiRouter = express.Router();
require('./app/server/routes/api')(apiRouter);
app.use('/api', apiRouter);

var authRouter = express.Router();
require('./app/server/routes/auth')(authRouter);
app.use('/auth', authRouter);

require('./app/server/routes')(app);

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);
