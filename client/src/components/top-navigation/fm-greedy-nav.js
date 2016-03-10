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