//Globals
var mongoose = require('mongoose');

//Global Models
var Post = require('../models/post.js');
var Library = require('../models/library.js');
var Search = require('../models/search.js');

//REST Models
//var Weather = require('http://api.wunderground.com/api/8bacae0472865331/conditions/q/CA/San_Francisco.json');

/*
 * POST handle posts.
 */
exports.index_post = function(req, res) {

	var users_ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

	//Split post into words.
	var str = req.body.post_content
		,	str_parts = str.split(' ')
		,	tags = []
		,	adds = []
		,	queries = [];

	function delegateQueries(str) {
		if (queries[0] != undefined) {
			console.log(queries);
			var i = 0
			,	max = queries.length;
			//Log Query

			function hasResponse() {
				if (i < max) {
					Search.findOne({ query: queries[i] }).exec(function(err, result) {
						if (err) {
							console.log('Search.find error!');
						}
						else {
							if (result == undefined) {
								saveQuery();
							}
							else {
								if (result.response == undefined && result.conditional == 0) {
									Search.update({ query: queries[i] },{ $inc: { poll: 1 }}).exec(function(err) {
										if (err) {
											console.log('update search poll error!')
										}
										else {
											console.log('sorry no answer.');
										}
									})
								}
								else {
									new Post({
										author: 'Popsql'
									,	users_ip: '107.23.94.247'
									,	spriteID: '/images/host.png'
									,	post: result.response
									}).save(function(err) {
										if (err) {
											console.log('response.post error!');
										}
										else {
											console.log('response.post success!');
										}
										Search.update({ query: queries[i] },{ $inc: { poll: 1 }}).exec(function(err) {
											if (err) {
												console.log('update search poll error!');
											}
											else {
												console.log('update search poll success!');
											}
										});

									});
								}
							}
						}

					});
				}
			}

			function saveQuery() {
				if (i < max) {
					new Search({
						user_ip: users_ip
					,	query: queries[i]
					,	poll: 1
					,	conditional: 0
					}).save(function(err) {
						if (err) {
							console.log('query save error!');
						}
						else {
							console.log('query save success!');
							hasResponse(i++);
						}
					});
				}
			}
			hasResponse();
			//saveQuery();
		}
	}

	function pushPost() {

		//POST to mongo
		new Post({
				post: str
			,	user_ip: users_ip
			, 	tags: tags
			,	adds: adds
			}).save(function(err) {
				if (err) {
					console.log('post save error!');
				}
				else {

					//POST to user feed	
					Post.find({post: str, user_ip: users_ip}).sort({date: -1}).limit(1).exec(function(error, my_post) {
						res.render('post', {
							posts_array: my_post
						});
						delegateQueries(str);
				   	});
				}
			});
	}

	function findTokens(source) {
		var isQuery = 0
		,	query = 0;

		function isToken(value, arr) {
			if (arr == '?') {
				value = value.replace(/\?/g, "");
				if (value.charAt(0).match(/#/)) {
					tags.push(value); //located tag
				}
				else if (value.charAt(0).match(/@/)) {
					adds.push(value); //located add
				}
			}
			else {
				if (value.charAt(0).match(/#/)) {
					tags.push(value); //located tag
				}
				else if (value.charAt(0).match(/@/)) {
					adds.push(value); //located add
				}
			}
		}

		for (i = 0; i < source.length; i++) {
			var value = source[i];
			//console.log("word" + i + ":" + source[i]);
			
			if (isQuery == 0) {

				isToken(value);
				
				if (value.charAt(0).match(/\?/)) {
					if (i == 0) {
						//query
						isToken(value, '?');
						queries[query] = value;
						isQuery = 1;
					}
					else {
						//query include
						isToken(value, '?');
						queries[query] = value;
						isQuery = 1;
					}
				}

			}

			else {
				
				isToken(value, '?');

				if (value.charAt(value.length - 1).match(/\?/)) {
					queries[query] = queries[query] + ' ' + value;
					query++;
					isQuery = 0;
				}
				else {
					queries[query] = queries[query] + ' ' + value;
				}

			}

		}
		
		if (queries[0] != undefined) {
			for (i = 0; i < queries.length; i++) {
				str = str.replace(queries[i], "<query>" + queries[i] + "</query>");
			}
			console.log('Query True');
		}
		else {
			console.log('Query False');
		}
		console.log(str);
		pushPost();
	}

	findTokens(str_parts, function (error, result) {
		if (error) {
			console.log('findTokens Error');
		}
		else {
			console.log('findTokens Worked');
		}
	});
};



/*
 * GET home page.
 */

exports.index = function(req, res){

	res.render('index', {
			title: 'Popsql'
	});

};

exports.index_postback = function(req, res){

	var action = req.body.action
	,	users_ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

	function manageSprites(posts) {
		for(i = 0; i < posts.length; i++) {
			if (posts[i].spriteID != '/images/host.png' && posts[i].user_ip != users_ip) {
				posts[i].spriteID = '/images/guest_b.png';
			}
		}
		return posts;
	}

	//initialize feed
	if (action == 'initialize') {
		Post.find().sort({date: -1}).limit(10).exec(function(err, posts) {
			manageSprites(posts);
			res.render('post', {
				posts_array: posts
			});
		});
	}

	//poll
	else if (action == 'poll') {
		var last_poll = req.body.date;
		Post.find({date: {$gt: last_poll}, user_ip: {$ne: users_ip}}).count().exec(function(err, new_posts) {
			res.json(new_posts);
		});
	}

	//update feed
	else if (action == 'update_feed') {
		var last_poll = req.body.date;
		Post.find({date: {$gt: last_poll}, user_ip: {$ne: users_ip}}).exec(function(err, posts) {
			manageSprites(posts);
			res.render('post', {
				posts_array: posts
			});
		});
	}
};

/*
 *	GET about us page.
 */

exports.index_aboutus = function(req, res){
	res.render('aboutus', { title: 'About Us'});
};
