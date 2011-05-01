// code for displaying stuff
(function(){

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

  // main function

  MONEY.domReady(function(){
  
    var functions = MONEY("#functions"),
      template = MONEY.template(MONEY("#template")[0].innerHTML),
      funcs = introspect.funcs(),
      build = MONEY.bind(buildEntry,null,template);
  
    // add function li's to the dom
    functions.html([
      build("",{ name: "top-level functions" },"notice"),
      MONEY.map(funcs.top,MONEY.bind(build,null,"$.")).join(""),
      build("",{ name: "functions on a returned selection" },"notice"),
      MONEY.map(funcs.selection,MONEY.bind(build,null,'$("").')).join("")
    ].join(""));
  
    doHijs(); // syntax highlighting
    inlineDocumentation();
    responsiveForms();
    addLivesearch(functions);
    moduleAddition();
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

  function addLivesearch(functions) {
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