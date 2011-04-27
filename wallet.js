var express = require("express"),
  colors = require("colors"),
  app = express.createServer(),
  enderReads = require("./read"),
  exec = require("child_process").exec;

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
    var cache = scripts.map(function(script){
      var info = script[2];
      info.source = script[1];
      return info;
    });
    // get the size too, nice to know
    enderReads.getSize(function(size){
      res.render("index",{
        locals: {
          modules: cache,
          directory: process.cwd(),
          size: size
        }
      });
    });
  });
});

// ajax routes for ender commands
// not appropriate http verbs but, like... whatever
app.get("/add/:module",processCommand.bind(null,"add"));
app.get("/remove/:module",processCommand.bind(null,"remove"));

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

app.listen(8083);
console.log("Howdy! See what's in yer $ at localhost:8083".underline.green);