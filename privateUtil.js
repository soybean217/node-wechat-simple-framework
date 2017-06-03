module.exports.raw = function(args, isFilterCode) {
	var keys = Object.keys(args);
	keys = keys.sort()
	var newArgs = {};
	keys.forEach(function(key) {
		newArgs[key.toLowerCase()] = args[key];
	});

	var string = '';
	for (var k in newArgs) {
		if (!(isFilterCode && (k == 'code' || k == 'state'))) {
			string += '&' + k + '=' + newArgs[k];
		}
	}
	if (string.length > 0) {
		string = string.substr(1);
	}
	return string;
};

module.exports.cleanedUrl = function(req) {
	cleanedQueryString = this.raw(req.query, true)
	if (cleanedQueryString.length > 0) {
		return req.protocol + '://' + req.hostname + req.url.split('?')[0] + '?' + cleanedQueryString
	} else {
		return req.protocol + '://' + req.hostname + req.url.split('?')[0]
	}
};