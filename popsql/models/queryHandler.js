/*
 *	module dependencies
 */

var Search = require('../models/search.js') //search schema
,	Post = require('../models/post.js') //post schema
,	Formula = require('../models/formula.js') //formula functions
;

/*
 *	module functions
 */

var _queries = {
	is_include: function (req, res) {
		var qcount = req.queries.length //count queries
		,	str = req.post.post; //eval post

		for (var i = 0; i < qcount; i++) {
			var sval = '<query>' + req['queries'][i] + '</query>'; //tags queries
			str = str.replace(sval, ''); //removes queries from post
		}

		str = str.replace(/ /g, ''); //scrub whitespace
		if (str == '') {
			return res(false); //is query
		}
		else {
			return res(true); //is query include
		}
	}, //end

	get_response: function (req, res) {
		console.log('get response:');
		_queries['index'](req, function (index) { //index responses
			return res(index); //returns indexed responses -> main module
		});
	}, //end

	index: function (req, res) {
		console.log('index:');
		_queries['get_index']({ queries: req['queries'], i: 0 }, function (got_index) {
			return res(got_index); //returns indexed responses -> get_responses
		});
	}, //end

	get_index: function (req, res) { //recursive
		var i = req['i']
		,	query = req['queries'][i]
		;
		console.log('get_index:' + i);
		if (i < req['queries'].length) {
			query = query.toLowerCase(); //normalize to lowercase
			query = query.trim(); //normalize to remove leading and trailing whitespace
			Search.findOne({
				query: query
			}).exec(function (err, result) {
				if (result == null) { //new query
					_queries['add_query'](queries[i], function (new_query) { //add query
						_queries['handle_response'](new_query, function (response) { //get response
							responses[i] = response; //assign response
							i++;
							_queries['get_index']({ queries: req['queries'], i: i }, res); //recurse
						});
					});
				}
				else { //existing query
					_queries['handle_response'](result, function (response) {
						responses[i] = response; //assign response
						i++;
						_queries['get_index']({ queries: req['queries'], i: i }, res); //recurse
					});
				}
			});
		}
		else {
			console.log('get_index: close');
			return res(responses); //returns indexed responses -> index
		}
	}, //end

	add_query: function (req, res) { //default entry
		new Search({
			query: req
		,	poll: 1
		,	has_formula: false
		,	source: {
				author: 'Popsql'
			,	handle: '@popsql'
			,	user_ip: '107.23.96.170'
			,	spriteID: '/images/host.png'
			}
		}).save(function (err, new_query) {
			return res(new_query)
		});
	}, //end

	handle_response: function (req, res) {
		if (req == null) { //new query
			_queries['no_answer'](req, function (post) {
				return res(post); //returns default answer -> get_index
			});
		}
		else { //existing query
			Search.update({ //increment poll
				_id: req['id']
			},{
				$inc: {
					poll: 1
				}
			}).exec(function (err, inc) {
				if (req['has_formula'] == false) { //no formula
					console.log('has_formula: false');
					if (req.response == undefined) { //no static answer
						_queries['no_answer'](req, function (post) {
							return res(post); //returns default answer -> get_index
						});
					}
					else { //static answer
						new Post({
							author : req['source']['author']
						,	handle: req['source']['handle']
						,	user_ip: req['source']['user_ip']
						,	spriteID: req['source']['spriteID']
						,	post: req['response']
						}).save(function (err, post) {
							return res(post); //returns static answer -> get_index
						});
					}
				}
				else { //has formula
					console.log('has_formula: true');
					if (req['response'] != undefined) { //cacheable answer
						console.log('cacheable answer');
						if (req['expires'] < new Date()) { //answer is expired
							console.log('expires: expired');
							Formula['use'](req['formula'], function (callback) { //api request
								_queries['update']({ 
									_id: req['_id']
								,	response: callback['post']
								,	new_expires: callback['new_expires']
								}, function () { //updated answer
									new Post({
										author : req['source']['author']
									,	handle: req['source']['handle']
									,	user_ip: req['source']['user_ip']
									,	spriteID: req['source']['spriteID']
									,	post: callback['post']
									}).save(function (err, post) {
										return res(post); //returns updated answer -> get_index
									});
								});
							});
						}
						else { //cached answer
							console.log('cached answer: ' + req['response']);
							new Post({
								author : req['source']['author']
							,	handle: req['source']['handle']
							,	user_ip: req['source']['user_ip']
							,	spriteID: req['source']['spriteID']
							,	post: req['response']
							}).save(function (err, post) {
								return res(post); //returns cached answer -> get_index
							});
						}
					}
					else { //dynamic answer
						//do something
					}
				}
			});
		}
	}, //end

	no_answer: function (req, res) {
		new Post({
			author: req['source']['author']
		,	handle: req['source']['handle']
		,	user_ip: req['source']['user_ip']
		,	spriteID: req['source']['spriteID']
		,	post: 'Sorry I don\'t have an answer for you yet.'
		}).save(function (err, post) {
			return res(post);
		});
	}, //end

	update: function (req, res) {
		var units = req['new_expires']['units']
		,	value = req['new_expires']['value'];

		_expires[units](value, function (new_expires) { //updates query
			Search.update({
				'_id': req['_id']
			},{
				$set: {
					'response': req['response']
				,	'expires': new_expires
				}
			}).exec(function (err, callback) {
				return res(true); //returns -> handle_response 
			});
		});
	}, //end
}

,	_expires = {
	h: function (req, res) {
		var new_exp = new Date();
		new_exp.setHours(new_exp.getHours() + req);
		return res(new_exp); //returns new_expires -> update
	}, //end
}

/*
 *	global variables
 */

var responses = [];

module.exports = {
	process: function(req, callback) {
		_queries['is_include'](req, function (is_include) {
			//handle includes
			if (is_include == false) { //post then answer
				console.log('is_include: false');
				_queries['get_response'](req, function () {
					console.log('got_index:');
					var posts = [];
					posts.push(req['post']);
					posts = posts.concat(responses); //construct flow
					return callback(posts);
				});
			}
			else { //post with appended answer
				//temp solution
				console.log('is_include: true');
				_queries['get_response'](req, function () {
					console.log('got_index:');
					var posts = [];
					posts.push(req['post']);
					posts = posts.concat(responses); //construct flow
					return callback(posts);
				});
			}
		});
	}
};