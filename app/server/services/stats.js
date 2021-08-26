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
    totalHackers: 0,
    totalMentors: 0,
    demo: {
      gender: {
        M: 0,
        F: 0,
        O: 0,
        N: 0
      },
      schools: {},
      companys: {},
      years: {}
    },
    teams: {},

    verifiedHackers: 0,
    submittedHackers: 0,
    admittedHackers: 0,
    confirmedHackers: 0,
    declinedHackers: 0,
    verifiedMentors: 0,
    submittedMentors: 0,
    admittedMentors: 0,
    confirmedMentors: 0,
    declinedMentors: 0,

    confirmedFemale: 0,
    confirmedMale: 0,
    confirmedOther: 0,
    confirmedNone: 0,

    shirtSizesHackers: {
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

    shirtSizesHackers: {
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

    shirtSizesMentors: {
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

    checkedInHackers: 0,
    checkedInMentors: 0
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

        newStats.confirmedFemale += (user.status.confirmedHackers || user.status.confirmedMentors) && user.profile.gender == "F" ? 1 : 0;
        newStats.confirmedMale += (user.status.confirmedHackers || user.status.confirmedMentors) && user.profile.gender == "M" ? 1 : 0;
        newStats.confirmedOther += (user.status.confirmedHackers || user.status.confirmedMentors) && user.profile.gender == "O" ? 1 : 0;
        newStats.confirmedNone += (user.status.confirmedHackers || user.status.confirmedMentors) && user.profile.gender == "N" ? 1 : 0;

        // Count the number of people who want hardware
        newStats.wantsHardware += user.confirmation.wantsHardware ? 1 : 0;

        // Dietary restrictions
        if (user.confirmation.dietaryRestrictions){
          user.confirmation.dietaryRestrictions.forEach(function(restriction){
            if (!newStats.dietaryRestrictions[restriction]){
              newStats.dietaryRestrictions[restriction] = 0;
            }
            newStats.dietaryRestrictions[restriction] += 1;
          });
        }

        if(user.mentor === true){
          newStats.totalMentors += 1;

          // Count verified
          newStats.verifiedMentors += user.verified ? 1 : 0;

          // Count submitted
          newStats.submittedMentors += user.status.completedProfile ? 1 : 0;

          // Count accepted
          newStats.admittedMentors += user.status.admitted ? 1 : 0;

          // Count confirmed
          newStats.confirmedMentors += user.status.confirmed ? 1 : 0;

          // Count declined
          newStats.declinedMentors += user.status.declinedMentors ? 1 : 0;

          // Count companys
          if (!newStats.demo.companys[email]){
            newStats.demo.companys[email] = {
            submitted: 0,
            admitted: 0,
            confirmed: 0,
            declined: 0,
            };
          }
          newStats.demo.companys[email].submitted += user.status.completedProfile ? 1 : 0;
          newStats.demo.companys[email].admitted += user.status.admitted ? 1 : 0;
          newStats.demo.companys[email].confirmed += user.status.confirmed ? 1 : 0;
          newStats.demo.companys[email].declined += user.status.declined ? 1 : 0;

          newStats.checkedInMentors += user.status.checkedIn ? 1 : 0;

          // Count shirt sizes
          if (user.confirmation.shirtSize in newStats.shirtSizesMentors){
            newStats.shirtSizesMentors[user.confirmation.shirtSize] += 1;
          }
        }
        else{
          newStats.totalHackers += 1;

          // Count verified
          newStats.verifiedHackers += user.verified ? 1 : 0;

          // Count submitted
          newStats.submittedHackers += user.status.completedProfile ? 1 : 0;

          // Count accepted
          newStats.admittedHackers += user.status.admitted ? 1 : 0;

          // Count confirmed
          newStats.confirmedHackers += user.status.confirmed ? 1 : 0;

          // Count declined
          newStats.declinedHackers += user.status.declinedHackers ? 1 : 0;


          // Count schools
          if (!newStats.demo.schools[email]){
            newStats.demo.schools[email] = {
              submitted: 0,
              admitted: 0,
              confirmed: 0,
              declined: 0,
            };
          }
          newStats.demo.schools[email].submitted += user.status.completedProfile ? 1 : 0;
          newStats.demo.schools[email].admitted += user.status.admitted ? 1 : 0;
          newStats.demo.schools[email].confirmed += user.status.confirmed ? 1 : 0;
          newStats.demo.schools[email].declined += user.status.declined ? 1 : 0;

          // Count years
          if (!newStats.demo.years[user.profile.graduationYear]){
              newStats.demo.years[user.profile.graduationYear] = {
              count: 0,
            };
          }
          newStats.demo.years[user.profile.graduationYear].count += newStats.demo.years[user.profile.graduationYear] ? 1 : 0;

                  // Count checked in
          newStats.checkedInHackers += user.status.checkedIn ? 1 : 0;

          // Count shirt sizes
          if (user.confirmation.shirtSize in newStats.shirtSizesHackers){
            newStats.shirtSizesHackers[user.confirmation.shirtSize] += 1;
          }
        }


        // Count graduation years
        //if (user.profile.graduationYear){
        //  newStats.demo.year[user.profile.graduationYear] += 1;
        //}

        // Grab the team name if there is one
        // if (user.teamCode && user.teamCode.length > 0){
        //   if (!newStats.teams[user.teamCode]){
        //     newStats.teams[user.teamCode] = [];
        //   }
        //   newStats.teams[user.teamCode].push(user.profile.name);
        // }

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

        // Transform schools into an array of objects
        var companys = [];
        _.keys(newStats.demo.companys)
          .forEach(function(key){
            companys.push({
              email: key,
              count: newStats.demo.companys[key].submitted,
              stats: newStats.demo.companys[key]
            });
          });
        newStats.demo.companys = companys;

        // Transform years into an array of objects
        var years = [];
        _.keys(newStats.demo.years)
        .forEach(function(key){
            if(key != "undefined"){
              years.push({
                year: key,
                count: newStats.demo.years[key],
              });
          }
        });
        newStats.demo.years = years;

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