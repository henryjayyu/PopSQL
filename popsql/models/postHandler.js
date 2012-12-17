var Post = require('../models/post.js')
,	sprites = require('../models/sprites.js');

function processTokens(req, callback1) {
	isQuery = false
,	queries = []
,	query = 0
,	tags = []
,	adds = [];

	for (var i = 0; i < str_parts.length; i++) {
		var part = str_parts[i];
		
		if (isQuery == false) {
			isToken(part);
			if (part.charAt(0).match(/\?/)) {
				if (i == 0) {
					//query?
				}
				else {
					//query include?
				}
				isToken(part, '?');
				isQuery = true
			,	queries[query] = part;
			}
		} 
		else {
			isToken(part, '?');
			if (part.charAt(part.length - 1).match(/\?/)) {
				queries[query] += ' ' + part
			,	query++
			,	isQuery = false;
			}
			else {
				queries[query] += ' ' + part;
			}
		}
	}
	return callback1(true);
}

function isToken(part, arr) {
	if (arr == '?') {
		part = part.replace(/\?/g, ''); //scrub char(?)
	}
	declareToken(part);
}

function declareToken(part) {
	if (part.charAt(0).match(/#/)) {
		tags.push(part); //located tag
	}
	else if (part.charAt(0).match(/@/)) {
		adds.push(part); //located address
	}
}

function processQueries(callback2) {
	if (queries[0] != undefined) {
		for (var i = 0; i < queries.length; i++) {
			str = str.replace(queries[i], "<query>" + queries[i] + "</query>");
		}
	}
	return callback2(true)
}

module.exports = { 
	process: function(req, data) {
		users_ip = req.users_ip;
		str = req.str;
		str_parts = str.split(' ');
		processTokens(str_parts, function (callback1) {
			processQueries(function (callback2) {
				new Post({ 
					post: str
				,	user_ip: users_ip
				,	tags: tags
				,	adds: adds
				}).save(function (err, callback3) {
					sprites.handle(callback3, users_ip, function (callback) {
						return data({queries: queries, post: callback});
					});
				});
			});
		});
	}
};