var express = require("express"),
  colors = require("colors"),
  enderReads = require("./read"),
  exec = require("child_process").exec,
  _ = require("underscore")._,
  port = 8083;

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

function serveWallet(req,res) {
  enderReads.read(function(scripts){
    var enderPos = 0,
      cache = scripts.map(function(script,i){
        var info = script[2];
        info.source = script[1];
        if(info.name == "ender-js") enderPos = i;
        return info;
      });
    // need to make sure ender-js shows up first
    if(enderPos !== 0) {
      var enderjs = cache.splice(enderPos,1);
      cache.unshift(enderjs[0]);
    }
    // funky _.without args require funkiness
    var args = _.pluck(cache,"name");
    args.unshift(enderReads.jeesh);
    var unusedJeesh = _.without.apply(null,args);
    // get the size too, nice to know
    enderReads.getSize(function(size){
      res.render("index",{
        locals: {
          modules: cache,
          directory: process.cwd(),
          size: size,
          unusedJeesh: unusedJeesh.map(function(n){ return {name:n} }),
          jeeshNotice: (unusedJeesh.length) ?
            "Some of the jeesh are not in your build... Click one to add one!" :
            "All the jeesh are in the build."
        }
      });
    });
  });
}

function run(_port) {
  var p = _port || port;
  var app = express.createServer();
  // stache enabling
  app.set('view engine', 'mustache');
  app.set("views", __dirname + '/views');
  app.register(".mustache", require("stache"));
  // public folder enabling
  app.use(express.static(__dirname + '/public'));
  // the only visible route, other than static stuff and the ajax stuff
  app.get("/",serveWallet);
  // ajax routes for ender commands
  // not appropriate http verbs but, like... whatever
  app.get("/add/:module",processCommand.bind(null,"add"));
  app.get("/remove/:module",processCommand.bind(null,"remove"));
  // set it loose!
  app.listen(p);
  // let them know
  var greeting = "Howdy! See what's in yer $ at localhost:"+p+"";
  console.log(greeting.underline.green);
}

module.exports = {
  run: run
};