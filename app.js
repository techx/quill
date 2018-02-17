// Load the dotfiles.
require('dotenv').load({silent: true});

var express         = require('express');

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

const compression = require('compression');
const minify = require('express-minify');

var app             = express();

// Connect to mongodb
mongoose.connect(database);

app.use(compression());
app.use(minify());
app.use(morgan('dev'));
app.use(cookieParser());

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.use(methodOverride());

app.use('/', express.static(__dirname + '/www/dist'));
app.use('/404', express.static(__dirname + '/www/dist'));
app.use('/register', express.static(__dirname + '/app/client'));
app.use('/files', express.static(__dirname + '/files'));
// Handy Redirects =============================================================

// Prospectus
app.use('/sponsorship/vthacks-v-prospectus',
  express.static(__dirname + '/files/vthacks-v-prospectus.pdf'));

app.get('/sponsorship/prospectus', (req, res) => {
  res.redirect('/sponsorship/vthacks-v-prospectus');
});

// Bus Interest
app.get('/bus-interest', (req, res) => {
  res.status(302);
  res.redirect('https://docs.google.com/forms/d/e/1FAIpQLSd9jrXiuksvnoPWTdJsK5xBmbEXBo24MT6TY_2mKxpolZnLVw/viewform?usp=sf_link');
});

// Travel Reimbursement
app.get('/travel-reimbursement', (req, res) => {
  res.status(302);
  res.redirect('https://docs.google.com/forms/d/e/1FAIpQLScaqcQxoD6ayJS6wZpH5hj65pzyR0zPtpMSnX5kCg2qxtOqcA/viewform?usp=sf_link');
});


// Volunteer Form
app.get('/volunteering', (req, res) => {
  res.status(302);
  res.redirect('https://goo.gl/zyvVxd');
});

// Slack
app.get('/slack', (req, res) => {
  res.status(302);
  res.redirect('https://goo.gl/gyuEGx');
});

// Devpost
app.get('/devpost', (req, res) => {
  res.status(302);
  res.redirect('https://vthacks-v.devpost.com/');
});

// Minors form
app.get('/minors-form', (req, res) => {
  res.status(302);
  res.redirect('/files/minors-form.pdf');
});

// Minors form
app.get('/vthacks-minors', (req, res) => {
  res.status(302);
  res.redirect('/files/minors-form.pdf');
});

// Participant info form
app.get('/participant-info', (req, res) => {
  res.status(302);
  res.redirect('/files/participant-info.pdf');
});

// Waitlist
app.get('/waitlist', (req, res) => {
  res.status(302);
  res.redirect('https://goo.gl/forms/Vb6oJFeM2NL7dG0J2');
});

// Slides
app.get('/slides', (req, res) => {
  res.status(302);
  res.redirect('https://docs.google.com/presentation/u/1/d/1VBjx6j9FXLh6HyyKuUqfSsOkXyzDZkxbgolAQAAYk3w/edit?usp=sharing');
});

// Resumes
app.get('/resumes', (req, res) => {
  res.status(302);
  res.redirect('https://www.dropbox.com/request/ayPvTbKSFJsbrQLDeOBE');
});

// Routers =====================================================================

var apiRouter = express.Router();
require('./app/server/routes/api')(apiRouter);
app.use('/api', apiRouter);

var authRouter = express.Router();
require('./app/server/routes/auth')(authRouter);
app.use('/auth', authRouter);

require('./app/server/routes')(app);

// app.get('*', (req, res) => {
//   res.status(404).redirect('/404');
// });

// listen (start app with node server.js) ======================================
app.listen(port);
console.log("App listening on port " + port);

