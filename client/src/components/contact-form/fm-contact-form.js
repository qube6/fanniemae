directiveModule.directive('fmContactForm', [
  'fannieAPIservice',
  '$timeout',
  function (fannieAPIservice, $timeout) {
    var link = function($scope, $element, attr){
      $scope.contact = {};
      $scope.contact.apiUrl = attr.apiUrl;
      $scope.contact.selectChild = null;
      $scope.contact.selectOptions = [{ id: 'Select', name: 'Select'}];

      $scope.submitParent = function(){
        fannieAPIservice.getData($scope.contact.apiUrl, $scope.contact.selectParent)
        .success(function (result) {
            $scope.contact.selectOptions = result.options;
            $scope.contact.selectOptions.unshift({ id: '0', name: 'Select'});
            $scope.contact.selectChild = $scope.contact.selectOptions[0];
        });
      }
    }

    return {
      restrict: 'A',
      link: link,
      scope: true
    };
  }
]);