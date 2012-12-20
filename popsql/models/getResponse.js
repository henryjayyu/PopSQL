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
						responses[i] = handleResponse;
						i++;
						indexQuery(req, i, res);
					});
				});
			}
			else { //existing query
				handleResponse(result, function (handleResponse) {
					responses[i] = handleResponse;
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
			return res(callback);
		});
	}
	else {
		Search.update( { _id: req._id } , { $inc: { poll: 1} } ).exec(function (err, callback) {
			if (req.has_formula == false) { //no formula
				if (req.response == undefined) { //no answer
					console.log('no answer');
					noAnswer(null, function (callback) {
						return res(callback);
					});
				}
				else { //static answer
					console.log('static answer');
					new Post({ //post response
						author: 'Popsql'
					,	handle: '@popsql'
					,	user_ip: 'host'
					,	spriteID: '/images/host.png'
					,	post: req['response']
					}).save(function (err, callback) {
						return res(callback);
					});
				}
			}
			else { //has formula
				if (req.response == undefined) { //dynamic answer

				}
				else { //cacheable answer
					if (req['expires'] < new Date()) { //expired answer?
						useFormula.process(req['formula'], function (callback) {
							updateFormula({ //updates cached answer 
								_id: req._id
							,	response: callback['post']
							,	new_expires: callback['new_expires'] 
							}, function () {
								new Post({ //post response
									author: req['source']['author'] 
								,	handle: req['source']['handle'] 
								,	user_ip: req['source']['user_ip']
								,	spriteID: req['source']['spriteID']
								,	post: callback['post']
								}).save(function (err, callback) {
									console.log(callback);
									return res(callback);
								});
							});
						});
					}
					else { //cached answer
						new Post({ //post response
							author: req['source']['author'] 
						,	handle: req['source']['handle'] 
						,	user_ip: req['source']['user_ip']
						,	spriteID: req['source']['spriteID']
						,	post: req['response']
						}).save(function (err, callback) {
							return res(callback);
						});
					}
				}
			}
		});
	}
}

function updateFormula(req, res) { //reset cached answer
	var new_expires = {
		h: function (req, res) {
			var new_exp = new Date();
			new_exp.setHours( new_exp.getHours() + req);
			return res(new_exp);
		},
	};

	var units = req['new_expires']['units']
	,	value = req['new_expires']['value'];	

	new_expires[units](value, function (new_expires) {
		Search.update({ 
			'_id': req['_id']
		},{$set:{ 
			'response': req['response']
		, 	'expires': new_expires 
		}}).exec(function (err, callback) {
			return res(true);
		});
	});
	
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