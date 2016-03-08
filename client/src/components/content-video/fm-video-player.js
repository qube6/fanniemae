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