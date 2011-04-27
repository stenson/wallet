var express = require("express"),
  colors = require("colors"),
  app = express.createServer(),
  enderReads = require("./lib/read"),
  exec = require("child_process").exec,
  _ = require("underscore")._;

// stache enabling
app.set('view engine', 'mustache');
app.set("views", __dirname + '/views');
app.register(".mustache", require("stache"));

// public folder enabling
app.use(express.static(__dirname + '/public'));
app.use(express.favicon());

// the only visible route, other than static stuff and the ajax stuff
app.get("/",function(req,res){
  enderReads.read(function(scripts){
    var enderPos = 0,
      cache = scripts.map(function(script,i){
        var info = script[2];
        info.source = script[1];
        if(info.name == "ender-js") enderJSPos = i;
        return info;
      });
    // need to make sure ender-js shows up first
    if(enderPos !== 0) {
      var enderjs = cache.splice(enderPos,1);
      cache.unshift(enderjs);
    }
    // funky _.without args require funkiness
    var args = _.pluck(cache,"name");
    args.unshift(enderReads.jeesh);
    // get the size too, nice to know
    enderReads.getSize(function(size){
      res.render("index",{
        locals: {
          modules: cache,
          directory: process.cwd(),
          size: size,
          unusedJeesh: _.without.apply(null,args).map(function(name){
            return { name: name }
          })
        }
      });
    });
  });
});

// run an ender command via the ender cli
function processCommand(verb,req,res) {
  var module = req.params.module;
  if(module) {
    exec("ender "+verb+" "+module,function(err,data,stderr){
      // not handling the error, we'll see what happens
      res.redirect("/");
    });
  }
  else {
    res.send("whoa, fail. alpha excuses");
  }
}

// ajax routes for ender commands
// not appropriate http verbs but, like... whatever
app.get("/add/:module",processCommand.bind(null,"add"));
app.get("/remove/:module",processCommand.bind(null,"remove"));

app.listen(8083);
console.log("Howdy! See what's in yer $ at localhost:8083".underline.green);