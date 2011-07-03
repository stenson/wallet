var fs = require("fs"),
  path = require('path'),
  colors = require("colors"),
  exec = require("child_process").exec,
  ender = {
    get: require("ender/lib/ender.get"),
    file: require("ender/lib/ender.file"),
    util: require("ender/lib/ender.util")
    //jeesh: require("ender/lib/ender.jeesh")
  },
  // borrowed from ender
  commonJSBridge = { head: '!function () { var exports = {}, module = { exports: exports }; '
                   , foot: ' $.ender(module.exports); }();' },
  FILE = ender.file,
  UTIL = ender.util

function processPackages(_packages, options, callback) {
  var result = [], i = 0;
  FILE.constructDependencyTree(_packages, 'node_modules', function (tree) {
    FILE.flattenDependencyTree(tree, null, function (packages) {
      packages.forEach(function (name, j) {
        var packagePath = path.join('node_modules', name.replace(/\//g, '/node_modules/'))
          , location = path.join(packagePath, 'package.json');
        path.exists(location, function (exists) {
          if (!exists) {
            console.log('dependency ' + name.red + ' is currently not installed... for details check: ' + '$ ender info'.yellow);
            if (packages.length == ++i) {
               callback && callback(result);
            }
            return;
          }
          fs.readFile(location, 'utf-8', function (err, data) {
            if (err) return console.log('something whent wrong trying to read ' + location);
            var packageJSON = JSON.parse(data)
            , source;
            //CONSTRUCT MAIN SOURCE FILE
            if (!packageJSON.main) {
              packageJSON.main = [];
            } else if (typeof packageJSON.main == 'string') {
              packageJSON.main = [ packageJSON.main ];
            }
            FILE.constructSource(packagePath, packageJSON.main, function (source) {
              //CONSTRUCT BRIDGE
              FILE.constructBridge(packagePath, packageJSON.ender, function (content) {
                if (source && name !== 'ender-js' && !options.noop) {
                  source = [
                      commonJSBridge.head
                    , source.replace(/\n/g, '\n  ')
                    , 'provide("' + name.replace(/.*(?=\/)\//, '') + '", module.exports);'
                  ];
                  if (packageJSON.ender) source.push(content.replace(/\n/g, '\n  '));
                  else source.push('$.ender(module.exports);')
                  source = source.join('\n\n  ') + '\n\n}();';
                }
                //result[j] = source;
                result[j] = [name,source,packageJSON];
                if (packages.length == ++i) {
                  callback && callback(result);
                }
              });
            });
          });
        });
      });
    });
  });
}

module.exports = {
  read: function(callback) {
    ender.get.buildHistory(null,function(packages){
      var packs = packages.split(" ").slice(2);
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
    ender.file.enderSize(null,function(size){
      callback(((Math.round((size/1024) * 10) / 10)));
    });
  }//,
  //jeesh: ender.jeesh
}