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