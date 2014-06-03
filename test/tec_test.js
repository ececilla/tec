'use strict';

var tec = require('../lib/tec.js');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['awesome'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  'set_proxy_cache': function(test) {
    var x = 0;
    var mymodule = {
      sum:function(x,y){
        x = x+1;
        return x+y;
      }
    }
    tec.set_proxy_cache("sum");
    tec.cache(mymodule,1000);
    var result = mymodule.sum(2,2);
    test.equal(4,result);
    result = mymodule.sum()
    // tests here
    test.equal(tec.awesome(), 'awesome', 'should be awesome.');
    test.done();
  },
};
