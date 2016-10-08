(function() {
  function ios_ver (){
    var ios_ua = navigator.userAgent;
    if( ios_ua.indexOf("iPhone") > 0 ) {
      ios_ua.match(/iPhone OS (\w+)/g);
      var version = RegExp.$1.split("_")[0];
      return version;
    }
  }
  console.log(ios_ver());
  if (ios_ver() === '10') {
    window.__Touch = window.Touch;
    window.Touch = function(init) {
      this.target = init.target;
      this.identifier = init.identifier;
      this.clientX = init.clientX;
      this.clientY = init.clientY;
      this.pageX = init.pageX;
      this.pageY = init.pageY;
      this.screenX = init.screenX;
      this.screenY = init.screenY;
    }
    window.Touch.prototype = Object.create(window.__Touch.prototype);
    window.Touch.prototype.constructor = window.Touch;

    window.__TouchEvent = window.TouchEvent;
    window.TouchEvent = null;
  }
})();