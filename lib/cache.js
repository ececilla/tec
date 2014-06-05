var crypto = require("crypto");
var entries = {};
var _limit = -1;

/*
 * Removes the specified entry from the cache.
 */
function _remove_entry(module,proc_name,key){	

	delete entries[module._tec_hash][proc_name].cacheval[key];
	delete entries[module._tec_hash][proc_name].timeouts[key];	
	delete entries[module._tec_hash][proc_name].cacherr[key];
}

/*
 * Inits the internal cache object for this module and proc_name with defaults.
 */
function _init(module,proc_name){
	
	if(!module._tec_hash){
		var str = Object.keys(module).toString();
		module._tec_hash = crypto.createHash("md5").update(str).digest("base64");		
	}
	
	if(!entries[module._tec_hash])
		entries[module._tec_hash] = {};
	
	if(!entries[module._tec_hash][proc_name])
		entries[module._tec_hash][proc_name] = {cacheval:{},cacherr:{},timeouts:{},func:module[proc_name]};

}

/*
 * Gets the number of current entries in the cache.
 */
exports.size = function(module,proc_name){

	var val = 0;
	for(var h in entries){		
		for(var proc_name in entries[h]){
			for(var key in entries[h][proc_name].cacheval){
				val++;			
			}							
		}
	}
	return val;
}

/*
 * Limits the number of entries in the cache.
 */
exports.limit = function(n){
	_limit = n;
}

/*
 * Clears the contents of the cache.
 */
exports.clear = function(){

	for(var h in entries){
		for(var proc_name in entries[h]){
			for(var key in entries[h][proc_name]){
				clearTimeout(entries[h][proc_name].timeouts);
			}
		}
		delete entries[h];
	}
	delete entries;
}


/*
 * Injects cache proxy into module.
 */
exports.cache = function(module,proc_name,timeout){
	
	if(isNaN(timeout))
		throw "timeout must be a number";
	
	_init(module, proc_name);					 					
	module[proc_name] = function(){
		
		var args = Array.prototype.slice.call(arguments);				
		if(typeof args[args.length-1] === "function"){//async function
								
			var cb = args[args.length-1];
			args = args.splice(0,args.length-1);					
			var key = args.toString();						
			if(!entries[module._tec_hash][proc_name].cacheval[key]){
						
					entries[module._tec_hash][proc_name].func.apply(this,args.concat(function(err,val){
						var nkeys = Object.keys(entries[module._tec_hash][proc_name].cacheval).length;						
						if(nkeys < _limit || _limit === -1){
							entries[module._tec_hash][proc_name].cacherr[key] = err;
							entries[module._tec_hash][proc_name].cacheval[key] = val;
							entries[module._tec_hash][proc_name].timeouts[key] = setTimeout(function(){
								
								_remove_entry(module,proc_name,key);
							},timeout);							
						}
						cb(err,val);						
					}));				
			}else{
				cb(entries[module._tec_hash][proc_name].cacherr[key],entries[module._tec_hash][proc_name].cacheval[key]);
			}
		}else{//sync function
			
			var key = args.toString();							
			if(!entries[module._tec_hash][proc_name].cacheval[key]){
				var nkeys = Object.keys(entries[module._tec_hash][proc_name].cacheval).length;
				var retval = entries[module._tec_hash][proc_name].func.apply(this,args);
				if(nkeys < _limit || _limit === -1){
					entries[module._tec_hash][proc_name].cacheval[key] = retval;
					entries[module._tec_hash][proc_name].timeouts[key] = setTimeout(function(){
						
						_remove_entry(module,proc_name,key);
					},timeout);
				}
				return retval;				
			}
			return entries[module._tec_hash][proc_name].cacheval[key];
		}
	};									
		
};

