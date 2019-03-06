angular.module('reg')
  .factory('SettingsService', [
  '$http',
  function($http){

    var base = '/api/settings/';

    return {
      getPublicSettings: function(){
        return $http.get(base);
      },
      updateRegistrationTimes: function(open, close, closeUSC){
        return $http.put(base + 'times', {
          timeOpen: open,
          timeClose: close,
          timeCloseUSC: closeUSC
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
      updateWhitelistedEmails: function(emails){
        return $http.put(base + 'whitelist', {
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
      updateRejectionText: function(text){
        return $http.put(base + 'rejection', {
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
      getReview: function(){
        return $http.get(base + 'review')
      },
      updateReview: function(reviewers, reviewCriteria){
        return $http.put(base + 'review', {
          reviewers: reviewers,
          reviewCriteria: reviewCriteria
        });
      },
      getJudge: function(){
        return $http.get(base + 'judge')
      },
      updateJudge: function(judges, judgeCriteria){
        return $http.put(base + 'judge', {
          judges: judges,
          judgeCriteria: judgeCriteria
        });
      },
      updateAdmissions: function(admissions){
        return $http.put(base + 'admissions', {
          admissions: admissions
        });
      }
    };

  }
  ]);
