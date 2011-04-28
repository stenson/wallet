// code for figuring out who owns what functions

var introspect = (function(){
  
  var annotated = {
      top: {}, // top-level functions
      proto: {} // functions on the prototype
    },
    codes = {},
    testProto = null,
    funcs = {}, // final records, written by cull
    record = function(owner,func,name) {
      return {
        owner: owner, func: func,
        aliases: [], name: name
      }
    };
  
  return {
    diff: function(owner) {
      // var scripts = document.getElementsByTagName("script"),
      //   mostRecent = scripts[scripts.length-2],
      //   code = mostRecent.innerHTML;
      // need something with a __proto__
      if(!testProto) {
        testProto = $("div").__proto__;
      }
      // first the top-level
      for(var f in $) {
        if(!(f in annotated.top)) {
          annotated.top[f] = record(owner,$[f],f);
        }
      }
      // then the prototype of an element
      for(var p in testProto) {
        if(!(p in annotated.proto)) {
          annotated.proto[p] = record(owner,testProto[p],p);
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
      funcs = { top: ok[0], proto: ok[1] };
    },
    alphabetize: function(list) {
      return list.sort(function(a,b){
        return (a.name > b.name) ? 1 : -1;
      });
    },
    funcs: function() {
      return {
        top: introspect.alphabetize(funcs.top),
        proto: introspect.alphabetize(funcs.proto)
      };
    },
    codes: function() {
      var parsedCodes = [];
      return codes;
    }
  }
  
})();

// code for displaying stuff

function buildEntry(template,prefix,record,extraClass) {
  var als = record.aliases || [];
  return template({
    prefix: prefix,
    aliases: (als.length) ? "<em>aka</em> "+als.join(" <em>&amp;</em> ") : "",
    name: record.name,
    func: record.func,
    owner: record.owner,
    extraClass: MONEY.isString(extraClass) ? extraClass : "fn"
  });
}

// loading two enders appears to break all these functions
var hasClass = function(el,className) {
    return el[0].className.indexOf(className) >= 0;
  },
  removeClass = function(el,className) {
    el[0].className = el[0].className.replace(className,"");
  },
  toggleClass = function(el,cName) {
    hasClass(el,cName) ? removeClass(el,cName) : el.addClass(cName);
  };

MONEY.domReady(function(){
  var functions = MONEY("#functions"),
    template = MONEY.template(MONEY("#template")[0].innerHTML),
    funcs = introspect.funcs(),
    build = MONEY.bind(buildEntry,null,template);
  
  functions.html([
    build("",{ name: "top-level functions" },"notice"),
    MONEY.map(funcs.top,MONEY.bind(build,null,"$.")).join(""),
    build("",{ name: "functions on the prototype" },"notice"),
    MONEY.map(funcs.proto,MONEY.bind(build,null,'$("").')).join("")
  ].join(""));
  
  doHijs(); // syntax highlighting
  
  // accordion stuff
  MONEY("span.fn").click(function(e){
    var src = MONEY(this);
    toggleClass(src.next("div.info"),"visible");
    toggleClass(src,"open");
  });
  
  // nice input behavior
  MONEY("input")
    .focus(function(){
      MONEY(this).addClass("typing");
      if(this.value === this.defaultValue) {
        this.value = "";
      }
    })
    .blur(function(){
      if(this.value === "") {
        this.value = this.defaultValue;
        this.className = "";
      }
    })
  
  // livesearching
  var funcItems = functions.find("span.fn strong");
  MONEY("input#livesearch")
    .keyup(function(){
      var search = this.value.toLowerCase();
      // run through and hide what doesn't match
      MONEY.each(funcItems,function(func){
        var show = func.innerHTML.toLowerCase().indexOf(search) >= 0,
          parent = func.parentNode.parentNode;
        parent.style.display = (show) ? "block" : "none";
      });
    });
  
  // so you want to add a module?
  var moduleScreen = MONEY("#add-popup");
  MONEY("#add-a-module").click(function(){
    moduleScreen.css("visibility","visible");
  });
  // get rid of the popover if you click anywhere other than the main box
  moduleScreen.click(function(e){
    if(e.srcElement == this) {
      moduleScreen.css("visibility","hidden");
    }
  });
  // code for adding an arbitrary module
  var arbitrary = MONEY("#arbitrary")[0];
  // capture the submit event, redirect as link
  MONEY("#add-form form").submit(function(e){
    e.preventDefault();
    var value = arbitrary.value;
    if(value) {
      window.location.href = "/add/"+value;
    }
  });
});