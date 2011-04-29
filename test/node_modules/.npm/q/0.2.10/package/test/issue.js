
var Q = require("q");
var x = Q.when(1, function (one) {
    return Q.when(2, function (two) {
        return Q.reject('error');
    });
}, Q.error).then(null, Q.error);

