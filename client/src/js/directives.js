angular.module('fannieMae.directives', [])

.directive('fmOpenOnLoad', [
  '$document',
  function ($document) {
    var link = function ($scope, element, attrs) {
      $scope.toggleActive(attrs.fmOpenOnLoad, true);
    };
    
    return {
      restrict: 'A',
      link: link
    };
}])

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
      scope: true,
      restrict: 'A',
      link: link
    };
}])
.directive('greedyNav', ['$window',
  function ($window) {
    var link = function ($scope, $element, attrs) {
      var $nav = $element,
          $btn = $nav.find('button'),
          $links = $nav.find('li');
      
      $scope.visibleLinks = [];
      $scope.hiddenLinks = [];

      $scope.updateNav = function(){
        var availableSpace = $btn.hasClass('hidden') ? $nav[0].clientWidth : $nav[0].clientWidth - $btn[0].clientWidth - 30;
        //console.log(availableSpace);
      };

      angular.element($window).bind('resize', function() {
        $scope.updateNav();
      });

      $scope.updateNav();
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
            } else if (currentFixed != null) {
              var currentWrapper = currentFixed.find('fm-sticky'),
                  bottom = pos - currentFixed.data('height');
              if (curPos >= bottom){
                currentWrapper.addClass("absolute").css("top", bottom + 'px');
              } else {
                currentWrapper.removeClass("absolute").css("top", '');
              }
              //special case for header
              if (curPos == 0 && bottom < 0){
                currentWrapper.removeClass("absolute").css("top", '');
                currentFixed = null;
              }
            }
          });
        },
        compile = function compile(element, attrs, transclude) {
        },
        link = function($scope, element, attrs) {
          var pos = findPos(element[0]).top;
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
