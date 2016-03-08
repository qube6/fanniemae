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
      $scope.contact.showErrors = false;

      $scope.submitParent = function(){
        fannieAPIservice.getData($scope.contact.apiUrl, $scope.contact.topicBox)
        .success(function (result) {
            $scope.contact.selectOptions = result.options;
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

      $scope.validate = function(form){
        if (form.$valid) {
           var e = document.getElementsByName(form.$name);
           e[0].submit();
        } else{
          $scope.contact.showErrors = true;
        }
      }
    }


    return {
      restrict: 'E',
      link: link,
      scope: true
    };
  }
]);