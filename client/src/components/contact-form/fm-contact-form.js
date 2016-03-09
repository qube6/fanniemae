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