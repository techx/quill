// Load the dotfiles.
require('dotenv').load({silent: true});

var fs              = require('fs');
var https           = require('https');
var express         = require('express');
var privkey         = process.env.PRIVKEY;
var fullchain       = process.env.FULLCHAIN;

// Middleware!
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');
var morgan          = require('morgan');
var cookieParser    = require('cookie-parser');

var mongoose        = require('mongoose');
var port            = process.env.PORT || 3000;
var database        = process.env.DATABASE || process.env.MONGODB_URI || "mongodb://localhost:27017";

var settingsConfig  = require('./config/settings');
var adminConfig     = require('./config/admin');

var app             = express();

// Connect to mongodb
mongoose.connect(database);

app.use(morgan('dev'));
app.use(cookieParser());

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

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
if(privkey != '' && fullchain != ''){
  var cert = {
    key: fs.readFileSync(privkey, 'utf8'),
    cert: fs.readFileSync(fullchain, 'utf8'),
  };
  var server = https.createServer(cert, app).listen(port, function() {
    console.log('Quill listening on port ' + port + ' with SSL.');
  });
} else {
  app.listen(port);
  console.log("Quill listening on port " + port);
}
