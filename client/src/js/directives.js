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


.directive('fmStickyHeader', ['$window', 
  function($window) {
    var stickies = [],
        currentFixed = null,
        currentFixedIndex = null,
        scroll = throttle(function scroll() {
          angular.forEach(stickies, function($sticky, $index) {
            var wrapper = $sticky.find('fm-sticky'),
                pos = $sticky.data('pos'),
                height = $sticky.data('height'),
                curPos = $window.pageYOffset,
                isFixed = pos < curPos;
            
            wrapper.toggleClass("fixed", isFixed);

            if (isFixed){
              //initial load scenario - remove "fixed" class from any stickies higher up the page
              if (currentFixed != null && currentFixedIndex < $index){
                currentFixed.find('fm-sticky').removeClass('fixed'); 
              }
              currentFixed = $sticky;
              currentFixedIndex = $index;
            }
            // if no longer fixed, remove as currentFixed
            else if(currentFixed == $sticky){
              currentFixed = null;
              currentFixedIndex = null;
            }
            // Test to see if this header is hitting bottom of currentFixed
            // If so, change currentFixed to absolute position on page so it scrolls away
            else if (currentFixed != null) {
              var currentWrapper = currentFixed.find('fm-sticky'),
                  bottom = pos - currentFixed.data('height');
              if (curPos >= bottom){
                currentWrapper.addClass("absolute").css("top", bottom + 'px');
              } else {
                currentWrapper.removeClass("absolute").css("top", '');
              }
              //Special case for first header - if we hit top of page, remove absolute positioning
              if (curPos == 0 && bottom < 0){
                currentWrapper.removeClass("absolute").css("top", '');
                currentFixed = null;
                currentFixedIndex = null;
              }
            }
          });
        }, 10),
        resize = throttle(function compile() {
          angular.forEach(stickies, function($sticky, index) {
            setPositionalData($sticky);
          });
        }, 10),
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


.directive('fmTabs', 
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

.directive('fmValidator', 
  function() {
    var link = function ($scope, element, attrs) {
      var name = attrs.name;
      
      $scope.validateForm = function(){
        if ($scope[name].$valid) {
           element[0].submit();
        } else{
          element.addClass('show-errors');
        }
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
