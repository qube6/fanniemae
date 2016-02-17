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
        scroll = function scroll() {
          angular.forEach(stickies, function($sticky, index) {
            var sticky = $sticky[0],
                pos = $sticky.data('pos');
            
            if (pos <= $window.pageYOffset) {
              $sticky.addClass("fixed");

              var $next = stickies[index + 1];
              if ($next == undefined) return;
              var next = $next ? $next[0] : null,
                  npos = $next.data('pos');

              if (next && next.offsetTop >= npos - next.clientHeight)
                $sticky.addClass("absolute").css("top", npos - sticky.clientHeight + 'px');
            } else {
              var $prev = stickies[index - 1],
                  prev = $prev ? $prev[0] : null;

              $sticky.removeClass("fixed");

              if (prev && $window.pageYOffset <= pos - prev.clientHeight)
                $prev.removeClass("absolute").removeAttr("style");
            }
          });
        },
        compile = function compile(element, attrs, transclude) {
          return function($scope, element, attrs) {
            var sticky = element.children()[0],
                $sticky = angular.element(sticky);

            element.css('height', sticky.clientHeight + 'px');

            $sticky.data('pos', sticky.offsetTop);
            stickies.push($sticky);
          }
        },
        link = function($scope, element, attrs) {
            var sticky = element.children()[0],
                $sticky = angular.element(sticky);

            element.css('height', sticky.clientHeight + 'px');

            $sticky.data('pos', sticky.offsetTop);
            stickies.push($sticky);
          };

    angular.element($window).off('scroll', scroll).on('scroll', scroll);
    
    return {
      restrict: 'A',
      transclude: true,
      template: '<fm-sticky ng-transclude></fm-sticky>',
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
