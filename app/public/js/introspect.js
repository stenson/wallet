// code for figuring out who owns what functions

var introspect = (function(){
  
  var annotated = {
      top: {}, // top-level functions
      selection: {} // functions on the returned selection
    },
    codes = {},
    funcs = {}, // final records, written by cull
    record = function(owner,func,name) {
      return {
        owner: owner, func: func,
        aliases: [], name: name
      }
    };
  
  return {
    diff: function(owner) {
      // first the top-level
      for(var f in $) {
        if(!(f in annotated.top)) {
          annotated.top[f] = record(owner,$[f],f);
        }
      }
      // then the functions of a returned selection
      var testEl = $("div"),
        selection = (testEl.__proto__.length > 0) ? testEl.__proto__ : testEl;
      var selection = $("div");
      for(var p in selection) {
        if(!(p in annotated.selection) && !isFinite(p)) {
          annotated.selection[p] = record(owner,selection[p],p);
        }
      }
    },
    cull: function() {
      var ok = MONEY.map(annotated,function(hash,level){
        var read = [];
        MONEY.each(hash,function(record,name){
          for(var i = 0, l = read.length; i < l; i++) {
            if(read[i].func == record.func) {
              read[i].aliases.push(name);
              return false;
            }
          }
          read.push(record);
        });
        return read;
      });
      // save 'em
      funcs = { top: ok[0], selection: ok[1] };
    },
    alphabetize: function(list) {
      return list.sort(function(a,b){
        return (a.name > b.name) ? 1 : -1;
      });
    },
    funcs: function() {
      return {
        top: introspect.alphabetize(funcs.top),
        selection: introspect.alphabetize(funcs.selection)
      };
    },
    codes: function() {
      var parsedCodes = [];
      return codes;
    }
  }
  
})();