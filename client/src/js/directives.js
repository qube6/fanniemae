angular.module('fannieMae.directives', [])

.directive('fmCloseOnClickAway', [
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
}])

.directive('fmToggleParentOnClick', [
  '$document',
  function ($document) {
    var link = function ($scope, element, attrs) {
      var cls = attrs.toggleClass || 'open';

      element.on('click', function($event){
        element.parent().toggleClass(cls);
      });
    };
    
    return {
      restrict: 'A',
      link: link
    };
}])

.directive('fmCarousel', [
  function () {
    var link = function ($scope, element, attrs) {
      $scope.slides = element.find('li');
    };
    
    return {
      restrict: 'A',
      link: link
    };
}]);
