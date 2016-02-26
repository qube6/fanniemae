function findPos(obj) {
  var curleft = curtop = 0;
  do {
    curleft += obj.offsetLeft;
    curtop += obj.offsetTop;
  } while (obj = obj.offsetParent);
  return { left: curleft, top: curtop};
}

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