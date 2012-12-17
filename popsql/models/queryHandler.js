function determine_query(req, callback) {
	var qcount = req.queries.length
,	str = req.post.post;

	for (var i = 0; i < qcount; i++) {
		var sval = '<query>' + req.queries[i] + '</query>';
		str = str.replace(sval, '');
	}

	console.log('qcount: ' + qcount);
	console.log('str: ' + str);

	str = str.replace(/ /g, '');

	if (str == '') {
		return callback(false);
	}
	else {
		return callback(true);
	}

//	var split = req.post['post'].split(/<query>/);
//	console.log('split.length: ' + split.length);
//	console.log('split: ' + split);
//	if (split.length = 2 && split[0] = "") {
//		return callback('query');
//	}
//	else {
//		return callback('include');
//	}
}

module.exports = {
	process: function(req, isQuery) {
		determine_query(req, function (callback) {
			return isQuery({include: callback});
		});
	}
};