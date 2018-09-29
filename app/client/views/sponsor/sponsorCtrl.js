angular.module('reg')
.controller('SponsorCtrl', [
	'$rootScope',
	'$scope',
	'$window',
	function($rootScope, $scope, $window){
		$("input[type=checkbox]").on("click", updateBenefits);

		var updateBenefits = function() {
			$("input[name=Benefits]").val("");
			$.each($("input[type=checkbox]:checked"), function(i, benefit) {
				if (i === 0)
					$("input[name=Benefits]").val(benefit.value);
				else
					$("input[name=Benefits]").val($("input[name=Benefits]").val() + ", " + benefit.value);
			})
		}

		$scope.openModal = function() {
			$('#contactModal').modal('show')
		}

		$scope.sponsor = function() {
			$window.open("https://s3-us-west-1.amazonaws.com/hackuci2019/Hack2019SponsorshipPackage.pdf", "_blank");
		}
	}]);
