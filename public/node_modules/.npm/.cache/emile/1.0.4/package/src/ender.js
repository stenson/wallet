!function () {
  var e = emile.noConflict();
  var getOptions = function (duration, callback) {
    var d = typeof duration == 'number' ? duration : 1000;
    var cb = typeof callback == 'function' ? callback : typeof duration == 'function' ? duration : function(){};
    return [d, cb]
  };

  function fade(duration, callback, to) {
    var opts = getOptions(duration, callback);
    for (var i = 0, l = this.length; i < l; i++) {
      this[i].style.opacity = to ? 0 : 1;
      this[i].style.filter = 'alpha(opacity=' + (to ? 0 : 1 ) * 100 + ')';
      this[i].style.display = '';
    }
    return this.animate({
      opacity: to,
      duration: opts[0],
      after: opts[1]
    });
  }

  $.ender({
    animate: function (o) {
      var self = this;
      // quick! look! over there! someone is kicking a puppy!
      setTimeout(function () {
        for (var i = 0, l = self.length; i < l; i++) {
          e(self[i], o);
        }
      }, 0);
      return this;
    },

    fadeIn: function (duration, callback) {
      return fade.call(this, duration, callback, 1);
    },

    fadeOut: function (duration, callback) {
      return fade.call(this, duration, callback, 0);
    }
  }, true);
}();