[![Build Status](https://secure.travis-ci.org/ececilla/tec.png?branch=master)](http://travis-ci.org/ececilla/tec)
[![NPM version](https://badge.fury.io/js/tec.svg)](http://badge.fury.io/js/tec)
#tec: Time Eviction Cache#

_tec_ module is a time eviction cache with an integration via proxy injection that makes its work transparent. The usage is very simple, inject the cache into a target function and let _tec_ keep track of the returned values from the target function for you. 

No more checking for cache hits and misses that pollutes your business logic. _tec_ handles it under the hood and retrieves the information again when internal values have been evicted. It works for both synchronous and asynchronous target functions.

## Example

```javascript
var tec = require('tec');
var mymodule = {
	sum:function(x,y){
		console.log("sum(" + x + "," + y + ")");
		return x+y;
	}
}
tec.cache(mymodule,"sum",1000);//1 second eviction

mymodule.sum(5,5);
mymodule.sum(5,5);

```
The first time that the _sum_ function is called _tec_ routes the call to the target function, holds the value returned in memory so the next calls are served from within _tec_ itself. After the timeout the value is evicted, so a future call will be rerouted again to the source. This feature can be very handy for asynchronous fetches to a database or remote system to lower down the number of requests.

Following this line you can find the an example with an asynchronous target function.

```javascript
var tec = require('tec');
var mymodule = {
	sum:function(x,y){
		setTimeout(function(){
			cb(null, x+y);
		},5000);
	}
}
tec.cache(mymodule,"sum",1000);//1 second eviction

mymodule.sum(5,5,function(err,val){
	//val served from source
	mymodule.sum(5,5,function(err,val){
        //val served from internal cache
	});	
});

```

## To run the tests:
    $ grunt nodeunit

## License
Copyright (c) 2014 Enric Cecilla
Licensed under the MIT license.
