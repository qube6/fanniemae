angular.module('fannieMae.directives', [])

.directive('fmCloseOnClickAway', [
  '$document',
  function ($document) {
    var link = function ($scope, element, attrs) {
      var name = attrs.fmCloseOnClickAway;

      $document.on('click', function($event){
        if(!element[0].contains($event.target)  && $scope.isActive(name)){
          $scope.toggleActive(name, false);
        }
      });
    };
    
    return {
      restrict: 'A',
      link: link
    };
}])

.directive('fmToggleClass', [
  '$document',
  function ($document) {
    var link = function ($scope, element, attrs) {
      var cls = attrs.fmToggleClass || 'open';

      element.on('click', function($event){
        element.toggleClass(cls);
        if (attrs.fmToggleParent){
          element.parent().toggleClass(attrs.fmToggleParent)
        }
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

      $scope.isActiveSlide = function(i){
        return i == $scope.carouselIndex;
      }
      $scope.setActiveSlide = function(i){
        $scope.carouselIndex = i;
        updateVideoZIndex();
      }

      $scope.$watch('carouselIndex', updateVideoZIndex);

      // Bug with Angular-Carousel means sometimes video z-index is set too high */
      var updateVideoZIndex = function(){
        if ($scope.carouselIndex == undefined) return;
        var li = $scope.slides[$scope.carouselIndex];
        var video = li.getElementsByTagName("video");
        if (video.length > 0 ) video[0].style.zIndex = "0";
      }

    };
    
    return {
      restrict: 'A',
      link: link
    };
}])


.directive('fmStickyHeader', ['$window', 
  function($window) {
    var stickies = [],
        currentFixed = null,
        scroll = function scroll() {
          angular.forEach(stickies, function($sticky, index) {
            var wrapper = $sticky.find('fm-sticky'),
                pos = $sticky.data('pos'),
                height = $sticky.data('height'),
                curPos = $window.pageYOffset,
                isFixed = pos < curPos;
            
            wrapper.toggleClass("fixed", isFixed);

            if (isFixed){
              currentFixed = $sticky;
            } else {
              if (pos <= ($window.pageYOffset + currentFixed.data('height'))){
                currentFixed.addClass("absolute").css("top", curPos + 'px');
              } else{
                currentFixed.removeClass("absolute").css("top", '');
              }
            }
          });
        },
        compile = function compile(element, attrs, transclude) {
        },
        link = function($scope, element, attrs) {
          var pos = element[0].offsetTop;
          var height = element[0].clientHeight;
          element.data('pos', pos);
          element.data('height', height);
          element.css('height', height + 'px');
          stickies.push(element);
        };

    angular.element($window).off('scroll', scroll).on('scroll', scroll);
    
    return {
      restrict: 'A',
      transclude: true,
      template: '<fm-sticky class="wrapper" ng-transclude></fm-sticky>',
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
      link: link,
      scope: {}
    };
});
