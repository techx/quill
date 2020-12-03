const angular = require("angular");
const swal = require("sweetalert");

angular.module('reg')
  .controller('ApplicationCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    '$http',
    'currentUser',
    'settings',
    'Session',
    'UserService',
    function($scope, $rootScope, $state, $http, currentUser, settings, Session, UserService) {

      // Set up the user
      var user = currentUser.data;
      $scope.user = user;

      // Is the student from MIT?
      $scope.isMitStudent = $scope.user.email.split('@')[1] == 'mit.edu';

      // If so, default them to adult: true
      if ($scope.isMitStudent){
        $scope.user.profile.adult = true;
      }

      // Populate the school dropdown
      populateSchools();
      populateNationality();
      //_setupForm();

      $scope.regIsClosed = Date.now() > settings.data.timeClose;
      

      /**
       * TODO: JANK WARNING
       */
      function populateSchools(){
        $http
          .get('/assets/schools.json')
          .then(function(res){
            var schools = res.data;
            var email = $scope.user.email.split('@')[1];

            if (schools[email]){
              $scope.user.profile.school = schools[email].school;
              $scope.autoFilledSchool = true;
            }
          });

        $http
          .get('/assets/schools.csv')
          .then(function(res){
            $scope.schools = res.data.split('\n');
            $scope.schools.push('Other');

            var content = [];

            for(i = 0; i < $scope.schools.length; i++) {
              $scope.schools[i] = $scope.schools[i].trim();
              content.push({title: $scope.schools[i]});
            }

            $('#school.ui.search')
              .search({
                source: content,
                cache: true,
                onSelect: function(result, response) {
                  $scope.user.profile.school = result.title.trim();
                }
              });
          });
      }

      function populateNationality(){

        $http
          .get('/assets/nationality.csv')
          .then(function(res){
            $scope.nationality = res.data.split('\n');
            $scope.nationality.push('Other');

            var content = [];

            for(i = 0; i < $scope.nationality.length; i++) {
              $scope.nationality[i] = $scope.nationality[i].trim();
              content.push({title: $scope.nationality[i]});
            }

            $('#nationality.ui.search')
              .search({
                source: content,
                cache: true,
                onSelect: function(result, response) {
                  $scope.user.profile.nationality = result.title.trim();
                }
              });
          });
      }

      function _confirmUser(e){
        // console.log('confirm');
        var confirmation = $scope.user.confirmation;
        // console.log(confirmation);
        // Get the dietary restrictions as an array
        /* var drs = [];
        Object.keys($scope.dietaryRestrictions).forEach(function(key){
          if ($scope.dietaryRestrictions[key]){
            drs.push(key);
          }
        });
        confirmation.dietaryRestrictions = drs; */

        UserService
          .updateConfirmation(user._id, confirmation)
          .then(response => {
            swal("Woo!", "You're in!", "success").then(value => {
              $state.go("app.dashboard");
            });
          }, response => {
            swal("Uh oh!", "Something went wrong.", "error");
          });
      }

      function _updateUser(e){
        UserService
          .updateProfile(Session.getUserId(), $scope.user.profile)
          .then(response => {
            _confirmUser();
          }, response => {
            // console.log(response);
            swal("Uh oh!", "Something went wrong.", "error");
          });
      }

      function isMinor() {
        return !$scope.user.profile.adult;
      }

      function minorsAreAllowed() {
        return settings.data.allowMinors;
      }

      function minorsValidation() {
        // Are minors allowed to register?
        if (isMinor() && !minorsAreAllowed()) {
          return false;
        }
        return true;
      }

      function _setupForm() {
			// Custom minors validation rule
			$.fn.form.settings.rules.allowMinors = function (value) {
			return minorsValidation();
			};

			var fields = {}
			switch (user.profile.category) {
				case 'STUD_PROF':
					fields = Object.assign(
						basicDetailsFields,
						skillsFields,
						legalFields,
						miscFields)
					delete fields.past_school;
					break;
				case 'IND':
					fields = Object.assign(
						basicDetailsFields,
						skillsFields,
						legalFields,
						miscFields,
						indFields)
					delete fields.school;
					delete fields.course;
					break;
				case 'ORG':
					fields = Object.assign(
						corporateDetailsFields,
						basicDetailsFields,
						legalFields,
						miscFields,
						corporateOnlyFields
					)
					delete fields.age;
					delete fields.course;
					delete fields.gender;
					delete fields.nationality;
					delete fields.school;
					delete fields.past_school;
					break;
				default:
					break;
			}

			// Semantic-UI form validation
			$('.ui.form').form({
			inline: true,
			fields: fields
			});
    	}

      	var basicDetailsFields = {
			name: {
				identifier: 'name',
				rules: [
					{
						type: 'empty',
						prompt: 'Please enter your name.'
					},
					{
						type: 'regExp',
						value: /^([a-zA-Z]+\s)*[a-zA-Z]+$/i,
						prompt: 'Name can only contain characters.'
					}
				]
			},
			age: {
				identifier: 'age',
				rules: [
					{
						type: 'integer',
						prompt: '{name} must be an integer'
					},
					{
						type: 'integer[8..110]',
						prompt: 'Participant must be an adult.'
					}
				]
			},
			school: {
				identifier: 'school',
				rules: [
					{
						type: 'empty',
						prompt: 'Please enter your school name.'
					},
					{
						type: 'regExp',
						value: /^([a-zA-Z,-]+\s)*[a-zA-Z,-]+$/i,
						prompt: 'School can only contain characters, hyphen and comma.'
					}
				]
			},
			past_school: {
				identifier: 'past_school',
				rules: [
					{
						type: 'regExp',
						value: /(^$)|(^([a-zA-Z,-]+\s)*[a-zA-Z,-]+$)/i,
						prompt: 'School can only contain characters, hyphen and comma.'
					}
				]
			},
			phone: {
				identifier: 'phone',
				rules: [
					{
						type: 'empty',
						prompt: 'Please enter your phone number.'
					},
					{
						type: 'regExp',
						value: /^([0-9+]+\s)*[0-9+]+$/i,
						prompt: 'Phone number can only contain +, SPACE and [0-9] digits.'
					}
				]
			},
			course: {
			identifier: 'course',
			rules: [
					{
						type: 'empty',
						prompt: 'Please enter your course name.'
					}
				]
			},
			nationality: {
				identifier: 'nationality',
				rules: [
					{
						type: 'empty',
						prompt: 'Please enter your nationality.'
					},
					{
						type: 'regExp',
						value: /^([a-zA-Z]+\s)*[a-zA-Z]+$/i,
						prompt: 'Nationality can only contain characters.'
					}
				]
			},
			gender: {
				identifier: 'gender',
				rules: [
					{
						type: 'empty',
						prompt: 'Please select a gender.'
					}
				]
			}
		
      	}

	  	var corporateOnlyFields = {
			designation: {
				identifier: 'designation',
				rules: [
					{
						type: 'empty',
						prompt: 'Please specify your designation.'
					}
				]
			}
	  	}

      var corporateDetailsFields = {
        org_type: {
              identifier: 'org_type',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please specify your organisation\'s type.'
                }
              ]
            },
            org_is_indian: {
              identifier: 'org_is_indian',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please fill in the country of registration.'
                }
              ]
            },
            org_name: {
              identifier: 'org_name',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please specify your organisation\'s name.'
                }
              ]
            },
            org_address: {
              identifier: 'org_address',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please specify your organisation\'s address.'
                }
              ]
            },
            org_sector: {
              identifier: 'org_sector',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please specify your organisation\'s sector.'
                }
              ]
            },
            org_website: {
              identifier: 'org_website',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please specify your organisation\'s website.'
                },
                {
                  type: 'regExp',
                  value: '/(^$|^((https://)|(http://))(.)*)/i',
                  prompt: 'Not a valid URL. It should start with https://... or http://...'
                }
              ]
            },
			org_github: {
				identifier: 'org_github',
				rules: [
					{
						type: 'regExp',
						value: '/(^$|^(https://){0,1}(github.com/)+(.)*)/i',
						prompt: 'Not a valid github link.'
					}
				]
            },
            org_twitter: {
				identifier: 'org_twitter',
				rules: [
					{
						type: 'regExp',
						value: '/(^$|^(https://){0,1}(twitter.com/)+(.)*)/i',
						prompt: 'Not a valid twitter link.'
					}
				]
            }
      	}

		var indFields = {
			job_status: {
				identifier: 'job_status',
				rules: [
					{
						type: 'empty',
						prompt: 'Please specify your job status.'
					}
				]
            }
		}

		var skillsFields = {
			github: {
				identifier: 'github',
				rules: [
					{
						type: 'regExp',
						value: '/(^$|^(https://){0,1}(github.com/)+(.)*)/i',
						prompt: 'Not a valid github link.'
					}
				]
            },
            twitter: {
				identifier: 'twitter',
				rules: [
					{
						type: 'regExp',
						value: '/(^$|^(https://){0,1}(twitter.com/)+(.)*)/i',
						prompt: 'Not a valid twitter link.'
					}
				]
            },
			
		}

	  	var legalFields = {
			signatureLiability: {
				identifier: 'signatureLiabilityWaiver',
				rules: [
					{
						type: 'empty',
						prompt: 'Please type your digital signature.'
					},
					{
						type: 'regExp',
						value: /^([a-zA-Z]+\s)*[a-zA-Z]+$/i,
						prompt: 'Your Digital Signature can only contain characters.'
					}
				]
            },
            signaturePhotoRelease: {
              identifier: 'signaturePhotoRelease',
              rules: [
                {
					type: 'empty',
					prompt: 'Please type your digital signature.'
                },
                {
					type: 'regExp',
					value: /^([a-zA-Z]+\s)*[a-zA-Z]+$/i,
					prompt: 'Your Digital Signature can only contain characters.'
                }
              ]
            },
            signatureCodeOfConduct: {
				identifier: 'signatureCodeOfConduct',
				rules: [
					{
						type: 'empty',
						prompt: 'Please type your digital signature.'
					},
					{
						type: 'regExp',
						value: /^([a-zA-Z]+\s)*[a-zA-Z]+$/i,
						prompt: 'Your Digital Signature can only contain characters.'
					}
				]
            }
		}

		var miscFields = {
			declaration: {
				identifier: 'declaration',
				rules: [
					{
						type   : 'checked',
						prompt : 'You must agree to the declaration'
					}
				]
            }
		}

		$scope.submitForm = function(){
			_setupForm();
			if ($('.ui.form').form('validate form')){
				_updateUser();
			} else {
				swal("Uh oh!", "Please Fill The Required Fields Correctly", "error");
			}
		};
    }]);
