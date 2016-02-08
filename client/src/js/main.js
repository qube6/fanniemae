angular.module('fannieMae.controllers', []).
controller('MainController',
  function($scope, $timeout) {

    $scope.toggle = {};

    $scope.toggleActive = function(prop, state){
      if (!$scope.toggle.hasOwnProperty(prop)) $scope.toggle[prop] = false;
      $timeout(function(){
        $scope.toggle[prop] = state == undefined ? !$scope.toggle[prop] : state;
      }, 0)
    }

    $scope.isActive = function(prop){
      if (!$scope.toggle.hasOwnProperty(prop)) return false;
      return $scope.toggle[prop];
    }

    $scope.setHeaderSubmit = function(prop){
      $scope.toggleActive(prop, $scope.header.search.length > 0);
    }
});