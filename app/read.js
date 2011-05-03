var fs = require("fs"),
  path = require('path'),
  colors = require("colors"),
  exec = require("child_process").exec,
  ender = {
    get: require("ender/lib/ender.get"),
    file: require("ender/lib/ender.file"),
    jeesh: require("ender/lib/ender.jeesh")
  },
  // borrowed from ender
  commonJSBridge = { head: '!function () { var exports = {}, module = { exports: exports }; '
                   , foot: ' $.ender(module.exports); }();' }

// pass all files as data to the html page, then eval in the native webkit dom
// so you can tell what is what by differentiation

// had to copy the whole thing to get the names associated with scripts
function processPackages(packages,_isAsync,callback) {
  var _sync = [], _async = [], _asyncBridges = [], i = 0;
  packages.forEach(function (name) {
    if(!name) return;
    var location = path.join('node_modules', name, 'package.json');
    fs.readFile(location, 'utf-8', function (err, data) {
      if (err) throw err;
      var packageJSON = JSON.parse(data)
      , isAsync = /ender\-js|scriptjs/.test(name) || !packageJSON.ender ? false : _isAsync
      , source;
      //CONSTRUCT MAIN SOURCE FILE
      if (!packageJSON.main) {
        return console.log(name + ' source not found');
      } else if (typeof packageJSON.main == 'string') {
        packageJSON.main = [ packageJSON.main ];
      }
      ender.file.constructSource(isAsync, _async, name, packageJSON.main, function (result) {
        if (!isAsync) {
          source = result;
        } else {
          _async = result;
        }
        //CONSTRUCT BRIDGE
        ender.file.constructBridge(name, packageJSON.ender, function (content) {
          if (name == 'ender-js') {
            source = ender.file.processComment(source, "");
          } else {
            if (packageJSON.ender) {
              isAsync ? _asyncBridges.push(content) : (source += content);
            } else if (!isAsync) {
              source = commonJSBridge.head + source + commonJSBridge.foot;
            }
          }
          if (!isAsync) {
            _sync.push([name,source,packageJSON]);
          }
          if (packages.length == ++i) {
             callback && callback(_sync, _async, _asyncBridges);
          }
        });
      });
    });
  });
}

module.exports = {
  read: function(callback) {
    ender.get.buildHistory(function(packages){
      var packs = packages.split(" ").slice(2);
      if(packs[0] == "jeesh") {
        packs = ender.jeesh;
      }
      if(packs[0] == "") {
        packs = [];
      }
      if(packs[0] != "ender-js") {
        packs.unshift("ender-js");
      }
      processPackages(packs,false,function(scripts){
        callback(scripts);
      });
    });
  },
  checkEnderExistence: function(callback) {
    path.exists('./ender.js',callback);
  },
  getSize: function(callback) {
    ender.file.enderSize(function(size){
      callback(((Math.round((size/1024) * 10) / 10)));
    });
  },
  jeesh: ender.jeesh
}