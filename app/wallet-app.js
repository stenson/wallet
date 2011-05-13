var express = require("express"),
  colors = require("colors"),
  enderReads = require("./read"),
  exec = require("child_process").exec,
  // the default port for wallet
  port = 8083,
  noPackages = false; // are there no packages installed?

// run an ender command via the ender cli
function processCommand(verb,req,res) {
  var module = req.params.module;
  if(module) {
    exec("ender "+verb+" "+module,function(err,data,stderr){
      if(err) console.log("ERROR".red,err);
      res.redirect("/");
    });
  }
  else {
    res.send("whoa, fail. alpha excuses");
  }
}

function pluck(arr,key) {
  return arr.map(function(t){ return t[key] });
}

function without(arr,without) {
  return arr.filter(function(x){
    return !without.some(function(y){
      return x == y;
    });
  });
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
    // update global state, little bit hacky
    noPackages = cache.length <= 1;
    // need to make sure ender-js shows up first
    if(enderPos !== 0) {
      var enderjs = cache.splice(enderPos,1);
      cache.unshift(enderjs[0]);
    }
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
}

function run(_port) {
  var p = _port || port,
    app = express.createServer(),
    packages = [];
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
  app.get("/add/:module",function(req,res){
    var verb = (noPackages) ? "build" : "add";
    processCommand(verb,req,res);
  });
  app.get("/remove/:module",processCommand.bind(null,"remove"));
  // set it loose if there's any ender around
  enderReads.checkEnderExistence(function(exists){
    if(exists) {
      app.listen(p);
      var greeting = "Howdy! See what's in yer $ at localhost:"+p+"";
      console.log(greeting.underline.green);
    }
    else {
      console.log("there's no ender here. gotta have a $ to look inside.".red);
    }
  });
}

module.exports = {
  exec: function(cmd) {
    run();
  }
};