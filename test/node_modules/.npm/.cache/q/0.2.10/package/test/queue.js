
var Q = require("q");
var Queue = require("q/queue").Queue;

var q = Queue();
//q.close();
q.put(1);
q.put(2);
Q.when(q.closed, function () {
    console.log("closed");
}, Q.error);

function loop() {
    return Q.when(q.get(), function (value) {
        console.log("value", value);
        return loop();
    }, function (reason) {
        console.log("reason", reason);
    });
}

loop();
