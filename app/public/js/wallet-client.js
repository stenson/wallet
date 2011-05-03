// code for displaying stuff
(function(){
  
  var buildEntry = cabin(function(o,prefix,record){
    var fullname = (record.aliases.length) ?
      zippedAka(record.name,record.aliases) :
      o("strong",record.name);
    
    return true,
      o("li",
        o("span.fn",
          o("em",prefix),
          o("strong",fullname)
        ),
        o("div.info",
          o("div.docs",
            o("span.owner",record.owner)
          ),
          o("pre",
            o("code",record.func||"")
          )
        )
      );
  });
  
  // hmm... this could be nicer... pretty fugly
  var zippedAka = cabin(function(o,name,aliases){
    var rest = [o("em"," aka ")];
    for(var i = 0, l = aliases.length; i < l; i++) {
      rest.push(o("text",aliases[i]));
      if(i+1 < l) rest.push(o("em"," || "));
    }
    return o.apply(null,["strong",o("text",name)].concat(rest));
  });
  
  var buildNotice = cabin(function(o,text){
    return o("li",o("span.notice",text));
  });
  
  function search(input,items,conditionFn) {
    input.keyup(function(){
      var search = this.value.toLowerCase();
      // run through and hide what doesn't match
      MONEY.each(items,function(item){
        item.el.style.display = (conditionFn(item)) ? "block" : "none";
      });
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

  // main function

  MONEY.domReady(function(){
  
    var functions = MONEY("#functions")
      , funcs = introspect.funcs()
      , els = [] // the lis gone end up in the list
      , buildMap = function(_funcs,buildFn) {
          MONEY.map(_funcs,function(fn){
            var el = buildFn(fn);
            els.push(el);
            fn.el = el;
          });
        };
    
    // push the top-level functions
    els.push(buildNotice("top-level functions"));
    buildMap(funcs.top, $.bind(buildEntry,null,"$."));
    // push the selection-level functions
    els.push(buildNotice("functions on a returned selection"));
    buildMap(funcs.selection, $.bind(buildEntry,null,'$("").'));
    // add the els to the dom tree
    functions[0].appendChild(cabin.o.listFragment(els));
  
    doHijs(); // syntax highlighting
    inlineDocumentation();
    responsiveForms();
    moduleAddition();
    
    var searchables = funcs.top.concat(funcs.selection);
    // by function name
    addLivesearch(MONEY("#livesearch"),searchables,function(rec,str){
      return rec.name.toLowerCase().indexOf(str) >= 0;
    });
    // by module owner name
    addLivesearch(MONEY("#search-by-module"),searchables,function(rec,str){
      return rec.owner.toLowerCase().indexOf(str) >= 0;
    });
  });
  
  // functions for cleaning up main ondomready function

  function inlineDocumentation() {
    // accordion stuff
    MONEY("span.fn").click(function(){
      var src = MONEY(this);
      toggleClass(src.next("div.info"),"visible");
      toggleClass(src,"open");
    });
  }

  function responsiveForms() {
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
  }

  function addLivesearch(el,listing,comparison) {
    el.keyup(function(){
      var search = this.value.toLowerCase();
      MONEY.each(listing,function(func){
        func.el.style.display = (comparison(func,search)) ? "block" : "none";
      });
    });
  }

  function moduleAddition() {
    // so you want to add a module?
    var moduleScreen = MONEY("#add-popup");
    MONEY("#add-a-module").click(function(){
      moduleScreen.css("visibility","visible");
    });
    // get rid of the popover if you click anywhere other than the main box
    moduleScreen.click(function(e){
      var target = e.target || e.srcElement;
      if(target == this) {
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
  }
  
})();