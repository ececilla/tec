var crypto = require("crypto");
var entries = {};

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
exports.size = function(){

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
					entries[module._tec_hash][proc_name].cacherr[key] = err;
					entries[module._tec_hash][proc_name].cacheval[key] = val;
					entries[module._tec_hash][proc_name].timeouts[key] = setTimeout(function(){
						
						_remove_entry(module,proc_name,key);
					},timeout);
					cb(entries[module._tec_hash][proc_name].cacherr[key],entries[module._tec_hash][proc_name].cacheval[key]);
				}));
			}else{
				cb(entries[module._tec_hash][proc_name].cacherr[key],entries[module._tec_hash][proc_name].cacheval[key]);
			}
		}else{//sync function
			
			var key = args.toString();					
			if(!entries[module._tec_hash][proc_name].cacheval[key]){
				entries[module._tec_hash][proc_name].cacheval[key] = entries[module._tec_hash][proc_name].func.apply(this,args);
				entries[module._tec_hash][proc_name].timeouts[key] = setTimeout(function(){
					
					_remove_entry(module,proc_name,key);
				},timeout);
			}
			return entries[module._tec_hash][proc_name].cacheval[key];
		}
	};									
		
};

