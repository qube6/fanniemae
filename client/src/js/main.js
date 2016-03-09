angular.module('fannieMae.controllers', []).
controller('MainController',
  function($scope, $timeout, $window) {

    $scope.toggle = {};
    $scope.header = {
      'search' : ''
    };

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

    $scope.validateForm = function(form){
      if (form.$valid) {
         var e = document.getElementsByName(form.$name);
         e[0].submit();
      } else{
        $scope.showErrors = true;
      }
    }

    var scroll = function(){
      $scope.toggleActive('header-side-menu', false);
    }
    angular.element($window).off('scroll', scroll).on('scroll', scroll);
});
