angular.module('fannieMae.directives', [])

.directive('fmAccordion', [
  '$timeout',
  function ($timeout) {
    var link = function ($scope, element, attrs, controller) {
      $scope.allOpen = false;

      $scope.setAll = function(){
        $timeout(function(){
          $scope.allOpen = !$scope.allOpen;
          $scope.$broadcast('fmAccordionStateChange', $scope.allOpen);
        }, 0);
      }
    };
    
    return {
      restrict: 'EA',
      link: link,
      scope: true,
      bindToController: {
        closeOthers: '='
      },
      controllerAs: "$ctrl",
      controller: function () {
        this.closeOthers = this.closeOthers || true;
      }
    };
}])

.directive('fmAccordionItem', [
  '$timeout',
  function ($timeout) {
    var link = function ($scope, element, attrs, controller) {
      $scope.open = false;
      $scope.ignoreBroadcast = false;

      $scope.toggleItem = function(){
        $timeout(function(){
          $scope.open = !$scope.open;
          if($scope.open){
            $scope.ignoreBroadcast = true;
            $scope.$parent.$broadcast('fmAccordionItemOpen');
          }
        }, 0);
      };

      $scope.$on('fmAccordionItemOpen', function(){
        if(controller.closeOthers && !$scope.ignoreBroadcast){
          $scope.open = false;
        }
        $scope.ignoreBroadcast = false;
      });

      $scope.$on('fmAccordionStateChange', function($e, state){
        $scope.open = state;
      });

      $scope.isOpen = function(){
        return $scope.open;
      };
    };
    
    return {
      require: '^fmAccordion',
      restrict: 'EA',
      link: link,
      scope: true
    };
}]);