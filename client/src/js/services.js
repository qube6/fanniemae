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