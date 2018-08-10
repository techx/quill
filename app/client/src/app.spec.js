'use strict';
describe('testing adminSetting', function() {

  // Load the module that contains the `phoneDetail` component before each test
  beforeEach(function() {
      module('reg')
    });

  // Test the controller
  describe('adminSetttingsCtrl', function() {
    it('testing', inject(function($controller) {
        var scope = {};
        var ctrl = $controller('adminSetttingsCtrl', {$scope: scope});
    
        expect(3).toBe(3);
      }));
  });

});
