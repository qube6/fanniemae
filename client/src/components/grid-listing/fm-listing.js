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