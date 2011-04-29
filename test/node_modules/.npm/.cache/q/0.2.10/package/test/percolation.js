
var Q = require('q');

exports['test percolate'] = function (ASSERT, done) {

    var resolved, rejected;

    var result = Q.reject();

    var result = Q.when(result, function () {
        resolved = true;
        console.log('resolved');
    }, function () {
        rejected = true;
        console.log('rejected');
        return Q.reject();
    });

    result = Q.when(result, function () {
        resolved = true;
        console.log('resolved');
    }, function () {
        rejected = true;
        console.log('rejected');
        return Q.reject();
    });

    var turns = 0;
    function turn() {
        turns++;
        console.log('turn', turns);
        if (turns >= 3)
            check();
        else
            setTimeout(turn, 0);
    }

    turn();

    function check() {
        ASSERT.ok(rejected, 'should be rejected');
        ASSERT.ok(!resolved, 'should not be resolved');
        done();
    }

};

if (module == require.main)
    require('test').run(exports)

