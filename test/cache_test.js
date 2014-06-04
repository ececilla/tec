'use strict';
var tec = require('../lib/cache.js');

exports['tec'] = {
  setUp: function(done) {
    // setup here
    done();
  },
  tearDown:function(done){

    tec.clear();
    done();
  },
  "cache 1 module": function(test) {
    var count = 0;
    var mymodule = {
      sum:function(x,y){
        count = count+1;
        return x+y;
      }
    }    
    tec.cache(mymodule,"sum",500);
    var result = mymodule.sum(2,2);
    test.equal(4,result);
    test.equal(1,count);
    result = mymodule.sum(2,2);
    test.equal(4,result);
    test.equal(1,count);
    setTimeout(function(){
      result = mymodule.sum(2,2)
      test.equal(4,result);
      test.equal(2,count);
      test.expect(6);
      test.done();
    },1000);
        
  },
  "cache 2 modules": function(test) {
    var count1 = 0,
        count2 = 0,
        mymodule1 = {
          sum:function(x,y){
            console.log("sum...")
            count1 = count1+1;
            return x+y;
          }
        },
        mymodule2 = {
          mult:function(x,y){
            console.log("mult..")
            count2 = count2+1;
            return x*y;
          }
        };    
    tec.cache(mymodule1,"sum",500);
    tec.cache(mymodule2,"mult",500);
    var result = mymodule1.sum(2,2);
    test.equal(4,result);
    test.equal(1,count1);
    test.equal(0,count2);
    result = mymodule2.mult(2,2);
    test.equal(4,result);
    test.equal(1,count1);
    test.equal(1,count2);
    test.expect(6);
    test.done();
    
  }
};
