var express = require("express"),
  colors = require("colors"),
  app = express.createServer(),
  read = require("./read").read;

// stache enabling
app.set('view engine', 'mustache');
app.set("views", __dirname + '/views');
app.register(".mustache", require("stache"));

// public folder enabling
app.use(express.static(__dirname + '/public'));
app.use(express.favicon());

var cache = [];
read(function(scripts){
  cache = scripts.map(function(script){
    var info = script[2];
    info.source = script[1];
    return info;
  });
});

// the only route, other than static stuff
app.get("/",function(req,res){
  res.render("index",{
    locals: {
      modules: cache,
      directory: process.cwd()
    }
  });
});

app.listen(1987);
console.log("\n\nHowdy! See what's in yer $ at localhost:1987\n\n".green);