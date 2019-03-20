require('dotenv').config();
// Connect to mongodb
var mongoose        = require('mongoose');
var database        = process.env.DATABASE || "mongodb://localhost:27017";
mongoose.connect(database, {useNewUrlParser: true});

var User = require('../app/server/models/User');

var users = 10;
var username = 'admin';

for (let i = 0; i < users; i++){
    console.log('creating: ' + username + i);
    var email = username + i + '@school.edu';
    var password = 'foobar';

    // create new user
    var u = new User();
    u.email = email;
    u.password = User.generateHash(password);
    u.verified = true;
    u.admin = true;
    u.status.submitted = true;
    u.profile = {
        firstName: username,
        lastName: i,
        gender: "Male",

        ethnicity: 'White / Caucasian',

        school: "School",

        year: '2020',

        major: 'Computer Science',

        experience: 'Beginner',

        resume: {
            name: 'test',
            id: '1',
            link: 'https://google.com'
        },

        essay1: 'Test essay 1',

        essay2: 'Test essay 2',

        essay3: 'Test essay 3',

        skills: 'Hacking',

        linkedin: 'linkedin',
        github: 'github',
        other: 'other',

        role: {
            developer: true,
            designer: false,
            productManager: false,
            other: ''
        },

        transportation: true,

        adult: true,

        mlh: true

    };
    u.save(function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log(username + i + ' created');
        }
    });
}
