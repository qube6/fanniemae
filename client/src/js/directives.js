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

      $scope.$watch('carouselIndex', function(){
        if ($scope.carouselIndex == undefined) return;
        var li = $scope.slides[$scope.carouselIndex];
        var video = li.getElementsByTagName("video");
        if (video.length > 0 ) video[0].style.zIndex = "0";
      });

    };
    
    return {
      restrict: 'A',
      link: link
    };
}])

.directive('fmVideoPlayer', 
  function() {
    var link = function ($scope, element, attrs) {
      $scope.videoPaused = true;

      $scope.controlVideo = function($event) {
        var video = $event.currentTarget.nextElementSibling;
        if ($scope.videoPaused){
          video.play();
        } else{
          video.pause()
        }
        $scope.videoPaused = !$scope.videoPaused;
      }

      $scope.pauseVideo = function($event, pauseOnly) {
        var video = $event.currentTarget;
        video.pause()
        $scope.videoPaused = true;
      }
    }
    return {
      restrict: 'A',
      link: link
    };
});
