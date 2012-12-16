var Post = require('../models/post.js');

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
	console.log("I can see isQuery: " + isQuery);
	console.log("I can see queries: " + queries);
	if (queries[0] != undefined) {
		for (var i = 0; i < queries.length; i++) {
			str = str.replace(queries[i], "<query>" + queries[i] + "</query>");
		}
		console.log('Query: ' + queries.length);
	}
	else {
		console.log('Query: None');
	}
	return callback2(true)
}

function handleSprites(req, callback4) {
	for (var i = 0; i < req.length; i++) {
		if (req[i].spriteID != '/images/host.png' && req[i].user_ip != users_ip) {
			req[i].spriteID = '/images/guest_b.png';
		}
	}
	return callback4(req);
}

module.exports = { 
	process: function(req, data) {
		users_ip = req.users_ip;
		str = req.str;
		str_parts = str.split(' ');
		console.log("this is users_ip: " + users_ip);
		console.log("this is str: " + str);
		console.log("this is str_parts: " + str_parts);
		processTokens(str_parts, function (callback1) {
			console.log('received callback1!');
			processQueries(function (callback2) {
				console.log('received callback2!');
				new Post({ 
					post: str
				,	user_ip: users_ip
				,	tags: tags
				,	adds: adds
				}).save(function (err, callback3) {
					console.log('received callback3!');
					handleSprites(callback3, function (callback4) {
						return data(callback4);
					});
				});
			});
		});
	}
};