var _ = require('underscore');
var async = require('async');
var User = require('../models/User');

// In memory stats.
var stats = {};
function calculateStats(){
  console.log('Calculating stats...');
  var newStats = {
    lastUpdated: 0,

    total: 0,
    demo: {
      gender: {
        'Male': 0,
        'Female': 0,
        'Other': 0,
        'No Response': 0
      },
      ethnicity: {
        'White': 0,
        'Black or African American': 0,
        'Native American or Alaska Native': 0,
        'Asian or Pacific Islander': 0,
        'Hispanic/Latinx': 0,
        'Multiracial': 0,
        'Other': 0
      },
      schools: {},
      year: {
        '2019': 0,
        '2020': 0,
        '2021': 0,
        '2022': 0,
        'High School': 0,
        'Graduate': 0,
        'Other': 0
      },
      major: {},
      experience: {
        'Beginner': 0,
        'Intermediate': 0,
        'Advanced': 0
      },
      transportation: {
        'Transportation': 0
      }
    },

    teams: {},
    verified: 0,
    submitted: 0,
    admitted: 0,
    rejected: 0,
    waitlisted: 0,
    confirmed: 0,
    confirmedUSC: 0,
    declined: 0,

    transportationTotal: 0,

    confirmedFemale: 0,
    confirmedMale: 0,
    confirmedOther: 0,
    confirmedNone: 0,

    shirtSizes: {
      'XS': 0,
      'S': 0,
      'M': 0,
      'L': 0,
      'XL': 0,
      'XXL': 0,
      'WXS': 0,
      'WS': 0,
      'WM': 0,
      'WL': 0,
      'WXL': 0,
      'WXXL': 0,
      'None': 0
    },

    dietaryRestrictions: {},

    wantsHardware: 0,

    checkedIn: 0
  };

  User
    .find({})
    .exec(function(err, users){
      if (err || !users){
        throw err;
      }

      newStats.total = users.length;

      async.each(users, function(user, callback){

        // Grab the email extension
        var email = user.email.split('@')[1];

        // Add to the gender
        newStats.demo.gender[user.profile.gender] += 1;

        // Add to ethnicity
        newStats.demo.ethnicity[user.profile.ethnicity] += 1;

        // Add to year
        newStats.demo.year[user.profile.year] += 1;

        // Count verified
        newStats.verified += user.verified ? 1 : 0;

        // Count submitted
        newStats.submitted += user.status.submitted ? 1 : 0;

        // Count accepted
        newStats.admitted += user.status.admitted ? 1 : 0;

        // Count rejected
        newStats.rejected += user.status.rejected ? 1 : 0;

        // Count waitlisted
        newStats.waitlisted += user.status.rejected ? 1 : 0;

        // Count confirmed
        newStats.confirmed += user.status.confirmed ? 1 : 0;

        // Count confirmed that are USC
        newStats.confirmedUSC += user.status.confirmed && email === "usc.edu" ? 1 : 0;

        newStats.confirmedFemale += user.status.confirmed && user.profile.gender == "Female" ? 1 : 0;
        newStats.confirmedMale += user.status.confirmed && user.profile.gender == "Male" ? 1 : 0;
        newStats.confirmedOther += user.status.confirmed && user.profile.gender == "Other" ? 1 : 0;
        newStats.confirmedNone += user.status.confirmed && user.profile.gender == "No Response" ? 1 : 0;

        // Count declined
        newStats.declined += user.status.declined ? 1 : 0;

        // Count the number of people who need transportation
        newStats.transportationTotal += user.profile.transportation ? 1 : 0;

        // Count schools, label by email
        if (!newStats.demo.schools[email]){
          newStats.demo.schools[email] = {
            submitted: 0,
            admitted: 0,
            rejected: 0,
            waitlisted: 0,
            confirmed: 0,
            declined: 0,
          };
        }
        newStats.demo.schools[email].submitted += user.status.submitted ? 1 : 0;
        newStats.demo.schools[email].admitted += user.status.admitted ? 1 : 0;
        newStats.demo.schools[email].rejected += user.status.rejected ? 1: 0;
        newStats.demo.schools[email].waitlisted += user.status.waitlisted ? 1: 0;
        newStats.demo.schools[email].confirmed += user.status.confirmed ? 1 : 0;
        newStats.demo.schools[email].declined += user.status.declined ? 1 : 0;

        // Grab the team name if there is one
        // if (user.teamCode && user.teamCode.length > 0){
        //   if (!newStats.teams[user.teamCode]){
        //     newStats.teams[user.teamCode] = [];
        //   }
        //   newStats.teams[user.teamCode].push(user.profile.name);
        // }

        // Count shirt sizes
        if (user.confirmation.shirtSize in newStats.shirtSizes){
          newStats.shirtSizes[user.confirmation.shirtSize] += 1;
        }

        // Dietary restrictions
        if (user.confirmation.dietaryRestrictions){
          user.confirmation.dietaryRestrictions.forEach(function(restriction){
            if (!newStats.dietaryRestrictions[restriction]){
              newStats.dietaryRestrictions[restriction] = 0;
            }
            newStats.dietaryRestrictions[restriction] += 1;
          });
        }

        // Count checked in
        newStats.checkedIn += user.status.checkedIn ? 1 : 0;

        callback(); // let async know we've finished
      }, function() {
        // Transform dietary restrictions into a series of objects
        var restrictions = [];
        _.keys(newStats.dietaryRestrictions)
          .forEach(function(key){
            restrictions.push({
              name: key,
              count: newStats.dietaryRestrictions[key],
            });
          });
        newStats.dietaryRestrictions = restrictions;

        // Transform schools into an array of objects
        var schools = [];
        _.keys(newStats.demo.schools)
          .forEach(function(key){
            schools.push({
              email: key,
              count: newStats.demo.schools[key].submitted,
              stats: newStats.demo.schools[key]
            });
          });
        newStats.demo.schools = schools;

        // Likewise, transform the teams into an array of objects
        // var teams = [];
        // _.keys(newStats.teams)
        //   .forEach(function(key){
        //     teams.push({
        //       name: key,
        //       users: newStats.teams[key]
        //     });
        //   });
        // newStats.teams = teams;

        console.log('Stats updated!');
        newStats.lastUpdated = new Date();
        stats = newStats;
      });
    });

}

// Calculate once every five minutes.
calculateStats();
setInterval(calculateStats, 300000);

var Stats = {};

Stats.getUserStats = function(){
  return stats;
};

module.exports = Stats;
