
var Q = require("q");
Q.when(1, function (one) {
    throw new Error("one");
}, function (reason) {
    console.error(reason);
}).then(function () {
    ASSERT.ok(false, 'should not be');
    done();
}, function () {
    console.log('exception should cause throw');
});;

