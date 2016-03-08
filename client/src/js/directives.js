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

.directive('greedyNav', ['$window', '$compile', '$timeout', '$document',
  function ($window, $compile, $timeout, $document) {

    var link = function ($scope, $element, attrs) {
      var $nav = $element,
          items = [],
          $visibleLinks = angular.element($nav[0].querySelector('.visible-links'));
          openFlag = false;
            
      //make a copy of the static hidden menu
      angular.forEach(angular.element($nav[0].querySelector('.hide')).find('a'), function(link){
        items.push({title:link.innerHTML, url: link.attributes.href.value});
      });

      var updateNav = function(){
        var availableSpace = $nav[0].offsetWidth,
            stillRoom = true,
            left;

        $visibleLinks.html('');
        $scope.hiddenLinks = [];

        angular.forEach(items, function(item, i){
          if(stillRoom){
            //need to append these rather than create a scope variable because I have to measure with each item
            $visibleLinks.append('<li><a href="'+item.url+'">'+item.title+'</a></li>');
            //no more room?
            if($visibleLinks[0].offsetWidth > availableSpace - 70){
              left = items.length-i;
              //replace the one we just added with a more button
              $visibleLinks[0].lastChild.outerHTML = '<li class="nav-toggle" ng-class="{ \'open\' : isOpen() }"><button ng-click="toggleOpen()" ng-class="{ \'openNav\' : isOpen() }" type="button" class="fm-menu-toggle"><span class="sr-only">Toggle more items</span><span class="icon-bar one"></span><span class="icon-bar two"></span><span class="icon-bar three"></span><span class="outline"></span><span class="count">'+left+'</span></button></li>';
              //lets tuck the item we just replaced as the first item in hidden
              $scope.hiddenLinks.push(item);
              stillRoom = false;
            }
          } else {
            $scope.hiddenLinks.push(item);
          }
        });
        $compile($visibleLinks.contents())($scope);
      };

      $scope.isOpen = function(){
        return openFlag;
      };

      $scope.toggleOpen = function(){
        $timeout(function(){
          openFlag = !openFlag;
        }, 0);
      };

      var handleOffElement = function($event){
        if(!$element[0].contains($event.target)){
          $timeout(function(){
            openFlag = false;
          }, 0);
        }
      }

      angular.element($window).off('resize', updateNav).on('resize', updateNav);
      $document.off('click', handleOffElement).on('click', handleOffElement);
      $document.off('scroll', handleOffElement).on('scroll', handleOffElement);

      updateNav();
    };

    return {
      restrict: 'A',
      link: link,
      scope: true
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
              //initial load scenario
              if (currentFixed != null && currentFixed != $sticky){ currentFixed.find('fm-sticky').removeClass('fixed'); }
              currentFixed = $sticky;
            } else if(currentFixed == $sticky){
              currentFixed = null;
            }else if (currentFixed != null) {
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

.directive('fmVideoPlayer', ['$timeout',
  function($timeout) {
    var link = function ($scope, element, attrs) {
      $scope.videoPaused = true;
      $scope.video = element.find('video')[0];

      $scope.video.setAttribute('poster', attrs.poster);
      if(attrs.hasOwnProperty('autoplay')){
        $scope.video.setAttribute('autoplay', attrs.autoplay);
        $scope.video.setAttribute('controls', 'controls');
        $scope.videoPaused = false;
      }

      $scope.controlVideo = function($) {
        if ($scope.videoPaused){
          $scope.video.play();
          $scope.playVideo()
        } else{
          $scope.video.pause();
          $scope.pauseVideo()
        }
      }

      $scope.pauseVideo = function() {
        $timeout(function(){
          $scope.videoPaused = true;
          $scope.video.removeAttribute('controls');
        });
      }
      $scope.playVideo = function() {
        $timeout(function(){
          $scope.videoPaused = false;
          $scope.video.setAttribute('controls', 'controls');
        });
      }

      // handle video events from controls
      $scope.video.addEventListener('pause', $scope.pauseVideo, true);
      $scope.video.addEventListener('play', $scope.playVideo ,true);
    }
    return {
      restrict: 'E',
      link: link,
      scope: true,
      transclude: true,
      template: '<div class="fm-video-wrapper"><span class="icon" ng-class=" videoPaused ? \'fm-play-circle\' : \'fm-pause-circle\' " ng-click="controlVideo()"></span><video ng-transclude></video></div>'
    };
}])
.directive('tabs', 
  function() {
    var link = function ($scope, element, attrs) {
      //angular is weird and requires this to be a string for select to stay updated to activeTab model
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
})
.directive('listing', 
  function(fannieAPIservice) {
    var link = function ($scope, $element, attrs) {
      $scope.apiUrl = $element.attr('data-api-url');
      $scope.items = [];
      $scope.payload = $scope.payload || {}; //may init this in another directive based on baked in values
      $scope.dynamic = false;

      $scope.loadQuery = function(fresh){
        $scope.loading = true;
        if(fresh){
          $scope.dynamic = true;
          $scope.items=[];
        }
        fannieAPIservice.getData($scope.apiUrl, $scope.payload)
          .success(function (data) {
            // remove this. testing UI
            // $timeout(function(){
            $scope.items = $scope.items.concat(data.results);
            $scope.payload.start = data.start;
            $scope.payload.end = data.end;
            $scope.total = data.total;
            $scope.loading = false;
            // }, 2000);
          })
          .error(function(data, status, headers, config){      
            $scope.items = [];
          });
      }

    };
    return {
      restrict: 'A',
      link: link,
      scope: true
    };
})
// This will allow us to initialize a model based on whats in the markup. Angular would have you create a custom 
// service to initialize your model. This "feature" is great for SPA, crap for CMS
.directive('initModel', function($compile) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      
      //split out to handle nested objects i.e. payload.foo
      var parts = attrs.initModel.split('.');
      
      var obj;
      //iterate over and add nested objects as needed
      for(var i = 0; i < parts.length-1; i++){      
        obj = scope[parts[i]] = scope[parts[i]] || {};
      }
      
      //init the object to elements value
      obj[parts[parts.length-1]] = element[0].value;
      
      element.attr('ng-model', attrs.initModel);
      element.removeAttr('init-model');

      $compile(element)(scope);
    }
  };
});
