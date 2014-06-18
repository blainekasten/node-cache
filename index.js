function now() { return (new Date).getTime(); }
var cache = {},
    debug = false,
    hitCount = 0,
    missCount = 0;

exports.put = function(key, value, time, timeoutCallback) {
  var oldRecord, expire, record, timeout;

  if (debug) console.log('caching: '+key+' = '+value+' (@'+time+')');

  oldRecord = cache[key];
  cache.keys += ("," + key);

	if (oldRecord) {
		clearTimeout(oldRecord.timeout);
	}

	expire = time + now();
	record = {value: value, expire: expire};

	if (!isNaN(expire)) {
		timeout = setTimeout(function() {
	    exports.del(key);
	    if (typeof timeoutCallback === 'function') {
	    	timeoutCallback(key);
	    }
	  }, time);
		record.timeout = timeout;
	}

	cache[key] = record;
}

exports.del = function(key) {
  delete cache[key];
}

exports.clear = function() {
  cache = {};
}

exports.get = function(regexKey) {
  var matches, response = [];

  matches = cache.keys.match(regexKey)


  for (var i in matches){
    var data = cache[matches[i]];
    if (typeof data != "undefined") {
      if (isNaN(data.expire) || data.expire >= now()) {
        if (debug) hitCount++;
        response.push(data)
      } else {
        // free some space
        if (debug) missCount++;
        exports.del(key);
      }
    } else if (debug) {
      missCount++;
    }
  }
  return response;
}

exports.size = function() { 
  var size = 0, key;
  for (key in cache) {
    if (cache.hasOwnProperty(key)) 
      if (exports.get(key) !== null)
        size++;
  }
  return size;
}

exports.memsize = function() { 
  var size = 0, key;
  for (key in cache) {
    if (cache.hasOwnProperty(key)) 
      size++;
  }
  return size;
}

exports.debug = function(bool) {
  debug = bool;
}

exports.hits = function() {
	return hitCount;
}

exports.misses = function() {
	return missCount;
}
