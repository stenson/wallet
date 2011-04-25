var express = require("express"),
  fs = require("fs"),
  app = express.createServer(),
  exec = require('child_process').exec;

// stache enabling
app.set('view engine', 'mustache');
app.set("views", __dirname + '/views');
app.register(".mustache", require("stache"));

// public folder enabling
app.use(express.static(__dirname + '/public'));
app.use(express.favicon());

var utils = {
  clean: function(stuff) {
    // get rid of the color tags
    return stuff.replace(/\[\d\d\w/g,"");
  }
};

var cache = [];

// interface to ender
var ender = {
  list: function() {
    exec("ender list",function(err,out,stderr){
      if(err) throw err;
      var clean = utils.clean(out);
      clean.split("\n").forEach(function(line){
        if(line.indexOf("@") > -1) {
          var name = line.match(/[\w]+/)[0];
          ender.npmInfo(name,function(data){
            cache.push(data);
          });
        }
      });
    });
  },
  npmInfo: function(name,callback) {
    // borrowed from ender.npm
    exec("npm info "+name,function(err,out,stderr){
      if (err) throw err;
      var info;
      eval('info = ' + out);
      callback(info);
    });
  }
}

ender.list();

// basic list function
app.get("/",function(req,res){
  res.render("index",{
    locals: {
      modules: cache,
      directory: process.cwd()
    }
  });
});

app.get("/log",function(req,res){
  console.log(cache);
  res.send("logged");
})

app.get("/ender.js",function(req,res){
  // this isn't getting the right one, does that make sense?
  fs.readFile(process.cwd()+"/ender.js", "utf-8", function (err,data){
    res.send(data);
  });
});

app.listen(1987);