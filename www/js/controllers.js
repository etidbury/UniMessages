angular.module('starter.controllers', ['ionic'])


.controller('ProfileCtrl', function($scope,$location) {
  $scope.settings = {
    enableFriends: true
  };

        $scope.login=function() {
            console.log('login');

            $location.path('/login');
        };

});
