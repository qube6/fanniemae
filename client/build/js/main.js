angular.module('fannieMae', [
  'fannieMae.controllers',
  'fannieMae.directives',
  'angular-carousel',
  'ngSanitize',
  'ngTouch',
  'hmTouchEvents'
]);





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

angular.module('fannieMae.controllers', []).
controller('MainController',
  function($scope, $timeout, $window) {

    $scope.toggle = {};
    $scope.header = {
      'search' : ''
    };

    $scope.toggleActive = function(prop, state){
      if (!$scope.toggle.hasOwnProperty(prop)) $scope.toggle[prop] = false;
      $timeout(function(){
        $scope.toggle[prop] = state == undefined ? !$scope.toggle[prop] : state;
      }, 0)
    }

    $scope.isActive = function(prop){
      if (!$scope.toggle.hasOwnProperty(prop)) return false;
      return $scope.toggle[prop];
    }

    $scope.setHeaderSubmit = function(prop){
      $scope.toggleActive(prop, $scope.header.search.length > 0);
    }

    var scroll = function(){
      $scope.toggleActive('header-side-menu', false);
    }
    
    angular.element($window).off('scroll', scroll).on('scroll', scroll);
});

function findPos(obj) {
  var curleft = curtop = 0;
  do {
    curleft += obj.offsetLeft;
    curtop += obj.offsetTop;
  } while (obj = obj.offsetParent);
  return { left: curleft, top: curtop};
}

var setPageScroll = function(element){
  // Allow CSS to change
  setTimeout(function () {
    if (elementTopInViewport(element)) return;
    element.scrollIntoView();
    window.scrollBy(0, -150);  // to account for sticky nav/header
  }, 250);
  
}

function elementTopInViewport(el) {
  var rect = el.getBoundingClientRect();

  return (
    rect.top > 0 &&
    rect.top < window.innerHeight
  );
}

//From underscore.js
function throttle(func, wait, options) {
  var context, args, result;
  var timeout = null;
  var previous = 0;
  if (!options) options = {};
  var later = function() {
    previous = options.leading === false ? 0 : new Date().getTime();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function() {
    var now = new Date().getTime();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};

angular.module('fannieMae').factory('fannieAPIservice', function($http) {

  var fannieAPI = {};

  fannieAPI.getData = function(url, data) {
    return $http({
      params: data,
      method: 'GET',
      cache: true,
      url: url
    });
  };
  
  return fannieAPI;
});
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
directiveModule.directive('fmContactForm', [
  'fannieAPIservice',
  '$timeout',
  '$sce',
  function (fannieAPIservice, $timeout, $sce) {
    var link = function($scope, $element, attr){
      $scope.contact = {};
      $scope.contact.apiUrl = attr.apiUrl;
      $scope.contact.selectOptions = [];
      $scope.contact.contactText = '';
      $scope.contact.contactEmail = null;
      $scope.contact.showForm = false;
      $scope.contact.isDisabled = true;

      $scope.submitParent = function(){
        fannieAPIservice.getData($scope.contact.apiUrl, $scope.contact.topicBox)
        .success(function (result) {
            $scope.contact.selectOptions = result.options;
            $scope.contact.isDisabled = false;
        });
      }

      $scope.submitChild = function(){
        fannieAPIservice.getData($scope.contact.apiUrl, $scope.contact.topicBox)
        .success(function (result) {
            $scope.contact.showForm = true;
            $scope.contact.email = result.email;
            $scope.contact.text = $sce.trustAsHtml(result.text);
        });
      }
    }


    return {
      restrict: 'E',
      link: link,
      scope: true
    };
  }
]);
directiveModule.directive('fmVideoPlayer', ['$timeout',
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
directiveModule.directive('fmDropdown', [
  function () {
    var link = function ($scope, element, attrs, controller) {
      $scope.select = element.find('select');
      if ($scope.select.length != 1){
        console.err('fm-dropdown must contain 1 select element only');
        return;
      }

      $scope.selectlist = createSelectList( $scope.select );
      $scope.selectedOption = getSelected($scope.select[0]);

      $scope.setSelected = function(val){
        $scope.select.val(val);
        $scope.selectedOption = getSelected($scope.select[0]);
        $scope.select[0].onchange();
      }

    };
    var getSelected = function(select){
      if (select.selectedOptions && select.selectedOptions.length == 1){
        return select.selectedOptions[0];
      }
    }
    var createSelectList = function(select){
      var optList = select.find('option'),
          list = []
      angular.forEach(optList, function(option){
        if (!option.disabled){
          list.push({
            text: option.text,
            value: option.value
          })
        }
      });
      return list;
    }
    
    return {
      restrict: 'E',
      link: link,
      scope: true,
      transclude: true,
      template: "<div aria-hidden='true' class='fm-select-wrapper' fm-accordion><div class='fm-styled-select' fm-accordion-item ng-class='{ \"open\" : isOpen() }' ng-click='toggleItem()'>{{selectedOption.text}}</span></div><ul fm-accordion-item class='fm-select-submenu' ng-click='toggleItem()'><li ng-repeat='option in selectlist' ng-click='setSelected(option.value)'>{{option.text}}</li></ul></div><div ng-transclude class='sr-only'></div>"
    };
}])
directiveModule.directive('fmListing', 
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
directiveModule.directive('fmGreedyNav', ['$window', '$compile', '$timeout', '$document',
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

      var updateNav = throttle(function(){
        var availableSpace = $nav[0].offsetWidth,
            stillRoom = true,
            left,
            buttonTemplate;

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
              buttonTemplate = '<li class="nav-toggle" ng-class="{ \'open\' : isOpen() }" ng-click="toggleOpen()" >';
              buttonTemplate = buttonTemplate + '<button ng-class="{ \'openNav\' : isOpen() }" type="button" class="fm-menu-toggle">';
              buttonTemplate = buttonTemplate + '<span class="sr-only">Toggle more items</span><span class="icon-bar one"></span><span class="icon-bar two">';
              buttonTemplate = buttonTemplate + '</span><span class="icon-bar three"></span><span class="outline"></span><span class="count">'+left+'</span></button></li>';
              $visibleLinks[0].lastChild.outerHTML = buttonTemplate;
              //lets tuck the item we just replaced as the first item in hidden
              $scope.hiddenLinks.push(item);
              stillRoom = false;
            }
          } else {
            $scope.hiddenLinks.push(item);
          }
        });
        $compile($visibleLinks.contents())($scope);
      }, 10);

      $scope.isOpen = function(){
        return openFlag;
      };

      $scope.toggleOpen = function(){
        $timeout(function(){
          openFlag = !openFlag;
        }, 0);
      };

      var handleOffElement = throttle(function($event){
        if ($event.type == 'scroll' && !angular.element($element[0].offsetParent).hasClass('fixed')) return;
        if(!$element[0].contains($event.target)){
          $timeout(function(){
            openFlag = false;
          }, 0);
        }
      }, 10);

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