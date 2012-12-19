var Search = require('../models/search.js')
, 	Post = require('../models/post.js')
,	useFormula = require('../models/useFormula.js')
,	responses = [];

function indexQueries(req, res) { //processes queries for response
	responses = []; //void responses
	indexQuery(req.queries, 0, function (callback) {
		return res(callback);
	});
}

function indexQuery(req, i, res) { //recursive function
	if (i < req.length) {
		req[i] = req[i].toLowerCase(); //normalize to lowercase
		Search.findOne( { query: req[i] } ).exec(function (err, result) {
			if (result == null) { //new query
				addQuery(req[i], function (newQuery) {
					console.log('NEW query added!');
					handleResponse(null, function (handleResponse) {
						responses[i] = { 'formula': handleResponse['formula'], 'post': handleResponse['post'] };
						i++;
						indexQuery(req, i, res);
					});
				});
			}
			else {
				handleResponse(result, function (handleResponse) {
					responses[i] = { 'formula': handleResponse['formula'], 'post': handleResponse['post'] };
					i++;
					indexQuery(req, i, res);
				});
			}

		});
	}
	else {
		return res(responses);
	}
}

function addQuery(req, res) {
	new Search({
		query: req
	,	poll: 1
	}).save(function (err, callback) {
		return res(true);
	});
}

function handleResponse(req, res) {
	console.log('handleResponse:');
	if (req == null) { //no answer
		noAnswer(null, function (callback) {
			return res({
				formula: false
			,	post: callback
			});
		});
	}
	else {
		Search.update( { _id: req._id } , { $inc: { poll: 1} } ).exec(function (err, callback) {
			if (req.has_formula == false) {
				if (req.response == undefined) { //no answer
					console.log('no answer');
					noAnswer(null, function (callback) {
						return res({
							formula: false
						,	post: callback
						});
					});
				}
				else { //static answer
					console.log('static answer');
					new Post({
						author: 'Popsql'
					,	handle: '@popsql'
					,	user_ip: 'host'
					,	spriteID: '/images/host.png'
					,	post: req.response
					}).save(function (err, callback) {
						return res({
							formula: false
						,	post: callback
						});
					});
				}
			}
			else {
				if (req.response == undefined) { //formula answer

				}
				else { //cached answer
					if (req.expired < new Date()) { //expired answer?
						console.log('expired formula');
						useFormula.process({ header: { host: 'api.wunderground.com', path: '/api/8bacae0472865331/' }, arg: ['conditions/', 'q/', 'ca/', 'santa_monica', '.json'] }, function (callback) {
							console.log(callback);
						});
					}
					else { //cached answer
						console.log('still good!');
						//use cached answer
					}
				}
			}
		});
	}
}

function noAnswer(req, res) { //responds no answer
	new Post({
		author: 'Popsql'
	,	handle: '@popsql'
	,	user_ip: 'host'
	,	spriteID: '/images/host.png'
	,	post: 'Sorry I don\'t have an answer for you yet.'
	}).save(function (err, post) {
		return res(post);
	});
}

module.exports = {
	process: function(req, res) {
		console.log('getResponse.js:');
		indexQueries(req, function (callback) {
			return res(callback);
		});
	}
};