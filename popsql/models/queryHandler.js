function determine_query(req, callback) {
	var qcount = req.queries.length
,	str = req.post.post;

	for (var i = 0; i < qcount; i++) {
		var sval = '<query>' + req.queries[i] + '</query>';
		str = str.replace(sval, '');
	}

	str = str.replace(/ /g, '');

	if (str == '') {
		return callback(false);
	}
	else {
		return callback(true);
	}
}

module.exports = {
	process: function(req, isQuery) {
		determine_query(req, function (callback) {
			return isQuery({include: callback});
		});
	}
};