directiveModule.directive('fmAccordion', [
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
      bindToController: true,
      scope: {
        closeOthers: '=',
        clickAway: '='
      },
      controllerAs: "$ctrl",
      controller: function () {
        this.closeOthers = this.closeOthers == undefined ? true : this.closeOthers;
      }
    };
}])

.directive('fmAccordionItem', [
  '$timeout',
  function ($timeout) {
    var link = function ($scope, element, attrs, controller) {
      $scope.open = attrs.open != undefined;
      $scope.ignoreBroadcast = false;
      var closeOthers = controller.closeOthers;

      $scope.toggleItem = function(){
        $timeout(function(){
          $scope.open = !$scope.open;
          if($scope.open){
            $scope.ignoreBroadcast = true;
            $scope.$parent.$broadcast('fmAccordionItemOpen');
            if(closeOthers) setPageScroll(element[0]);
          }
        }, 0);
      };

      $scope.gotoAnchor = function (x) {
        var hash = 'anchor'+x;
        document.getElementById(hash).scrollTop;
        console.log(document.documentElement.scrollTop);
      }

      $scope.$on('fmAccordionItemOpen', function(){
        if(closeOthers && !$scope.ignoreBroadcast){
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