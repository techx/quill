angular.module('reg')
  .factory('SettingsService', [
  '$http',
  function($http){

    var base = '/api/settings/';

    return {
      getPublicSettings: function(){
        return $http.get(base);
      },
      updateRegistrationTimes: function(open, close){
        return $http.put(base + 'Registrationtimes', {
          timeOpenRegistration: open,
          timeCloseRegistration: close,
        });
      }, 
      updateHackathonTimes: function(open, close){
        return $http.put(base + 'hackathonTimes', {
          timeOpenHackathon: open,
          timeCloseHackathon: close,
        });
     },
      updateConfirmationTime: function(time){
        return $http.put(base + 'confirm-by', {
          time: time
        });
      },
      getWhitelistedEmails: function(){
        return $http.get(base + 'whitelist');
      },
      getOpenScoring: function(){
        return $http.get(base + 'openScoring');
      },
      updateWhitelistedEmails: function(emails){
        return $http.put(base + 'whitelist', {
          emails: emails
        });
      },
      getCompanysWhitelistedEmails: function(){
        return $http.get(base + 'companysWhitelist');
      },
      updateCompanysWhitelistedEmails: function(emails){
        return $http.put(base + 'companysWhitelist', {
          emails: emails
        });
      },
      updateWaitlistText: function(text){
        return $http.put(base + 'waitlist', {
          text: text
        });
      },
      updateAcceptanceText: function(text){
        return $http.put(base + 'acceptance', {
          text: text
        });
      },
      updateConfirmationText: function(text){
        return $http.put(base + 'confirmation', {
          text: text
        });
      },
      updateAllowMinors: function(allowMinors){
        return $http.put(base + 'minors', { 
          allowMinors: allowMinors 
        });
      },
      openScoringSystem: function(openScoring){
        return $http.put(base + 'scoring', {
          openScoring: openScoring
        });
      },
    };

  }
  ]);
