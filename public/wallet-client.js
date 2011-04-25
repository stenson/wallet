function buildEntry(name) {
  return "<li><span class='fn'><em class='money'>$.</em>"+name+"</span></li>";
}

$.domReady(function(){
  var functions = $("#functions"),
    lis = [];
  
  for(var s in $) {
    lis.push(buildEntry(s));
  }
  
  var proto = $("div").__proto__;
  for(var p in proto) {
    lis.push(buildEntry(p));
  }
  
  functions.html(lis.join(""));
});