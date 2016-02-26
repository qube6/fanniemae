var directiveModule = angular.module('fannieMae.directives', [])

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
.directive('greedyNav', ['$window', '$compile',
  function ($window, $compile) {

    var link = function ($scope, $element, attrs) {
      var $nav = $element,
          items = [],
          links = angular.element($nav[0].querySelector('.hide')).find('a'),
          $visibleLinks = angular.element($nav[0].querySelector('.visible-links'));
            

      angular.forEach(angular.element($nav[0].querySelector('.hide')).find('a'), function(link){
        items.push({title:link.innerHTML, url: link.attributes.href.value});
      });

      $scope.updateNav = function(){
        var availableSpace = $nav[0].querySelector('.wrap').offsetWidth,
            stillRoom = true,
            left;

        $visibleLinks.html('');
        $scope.hiddenLinks = [];

        angular.forEach(items, function(item, i){
          if(stillRoom){
            //need to append these rather than create a scope variable because I have to measure with each item
            $visibleLinks.append('<li><a href="'+item.url+'">'+item.title+'</a></li>');
            if($visibleLinks[0].offsetWidth > availableSpace - 70){
              left = items.length-i;
              $visibleLinks[0].lastChild.innerHTML = '<a class="more-items" href=""><span class="label">More</span><i class="icon fm-arrow-right"></i><span class="count">'+left+'</span></a>';
              //we just killed that from the visible nav so lets tuck it in as the first item in hidden
              $scope.hiddenLinks.push(item);
              stillRoom = false;
            }
          } else {
            $scope.hiddenLinks.push(item);
          }
        });

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
        resize = function compile() {
          angular.forEach(stickies, function($sticky, index) {
            setPositionalData($sticky);
          });
        },
        setPositionalData = function(element){
          element.css('height', '');
          var pos = findPos(element[0]).top;
          var height = element[0].clientHeight;
          element.data('pos', pos);
          element.data('height', height);
          element.css('height', height + 'px');
        }
        link = function($scope, element, attrs) {
          setPositionalData(element);
          stickies.push(element);
        };

    angular.element($window).off('scroll', scroll).on('scroll', scroll);
    angular.element($window).off('resize', resize).on('resize', resize);
    
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
})
.directive('tabs', 
  function() {
    var link = function ($scope, element, attrs) {
      $scope.activeTab = "0";
      //make a model for the select shown on mobile
      $scope.opts = [];      
      angular.forEach(angular.element(element[0].querySelector('.nav-block')).find('a'), function(opt, i){
        $scope.opts.push({title:opt.innerHTML, i: i.toString()});
      });      
      $scope.setTab = function(i) {
        $scope.activeTab = i.toString();
      };   
    };
    return {
      restrict: 'A',
      link: link,
      scope: true
    };
});
