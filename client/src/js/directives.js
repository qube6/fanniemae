angular.module('fannieMae.directives', [])
.directive('fmCloseOnClick', [
  '$document',
  function ($document) {
    var link = function ($scope, element, attrs) {
      var name = attrs.fmCloseOnClick;

      $document.on('click', function($event){
        if(!element[0].contains($event.target)){
          $scope.toggleActive(name, false);
        }
      });
    };
    
    return {
      restrict: 'A',
      link: link
    };
}]);


