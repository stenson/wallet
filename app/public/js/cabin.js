// github/stenson/cabin

var cabin = (function(){
  var doc = document
    , toA = function(args) {
        return Array.prototype.slice.apply(args);
      }
    , getClasses = function(str) {
        var matches = [];
        str.replace(classR,function(_,c){
          matches.push(c);
        });
        return matches;
      }
    , white = /^\s+$/
    , elR = /^[^\.#]+/
    , idR = /#([^\.$]+)/
    , classR = /\.([^\.$#]+)/g;
    
  // the building function
  var o = function(selector) {
    // whitespace check
    if(white.test(selector))
      return doc.createTextNode(selector);
    // ok, now proceed as normal
    var kids = toA(arguments).slice(1)
      , id = idR.exec(selector)
      , classes = getClasses(selector)
      , el = doc.createElement(elR.exec(selector));
    
    if(id)
      el.id = id[1];
    if(classes.length)
      el.className = classes.join(" ");
    if(kids[0].nodeType) {
      for(var i = 0, l = kids.length; i < l; i++) {
        el.appendChild(kids[i]);
      }
    }
    else
      el.appendChild(doc.createTextNode(kids[0]));
    return el;
  };
  
  o.parallelize = function(entries,template) {
    var fragment = doc.createDocumentFragment();
    for(var i = 0, l = entries.length; i < l; i++) {
      fragment.appendChild(template(entries[i]));
    }
    return fragment;
  };
  
  o.listFragment = function(entries) {
    var fragment = doc.createDocumentFragment();
    for(var i = 0, l = entries.length; i < l; i++) {
      fragment.appendChild(entries[i]);
    }
    return fragment;
  };
  
  // the interface returns a function
  var cabinFn = function(fn) {
    // the curried function
    return function() {
      return fn.apply(null,[o].concat(toA(arguments)));
    };
  };
  // for easy, non-currying access
  cabinFn.o = o;
  return cabinFn;
})();