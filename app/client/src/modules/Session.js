angular.module('reg')
  .service('Session', [
    '$rootScope',
    '$window',
    '$injector',
    function($rootScope, $window, $injector){

      this.create = function(token, user){
        $window.localStorage.jwt = token;
        $window.localStorage.userId = user._id;
        $rootScope.currentUser = user;
      };

      this.destroy = function(onComplete){
        delete $window.localStorage.jwt;
        delete $window.localStorage.userId;
        $rootScope.currentUser = null;
        if (onComplete){
          onComplete();
        }
      };

      this.getToken = function(){
        return $window.localStorage.jwt;
      };

      this.getUserId = function(){
        return $window.localStorage.userId;
      };

      this.getUser = function(){
        var http = $injector.get('$http');

        return http.get('/api/users/' + $window.localStorage.userId);
      };

      this.setUser = function(user){
        $window.localStorage.userId = user._id;
        $rootScope.currentUser = user;
      };

  }]);