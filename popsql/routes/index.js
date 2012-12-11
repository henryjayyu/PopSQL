//Globals
var mongoose = require('mongoose');

//Global Models
var Post = require('../models/post.js');
var Library = require('../models/library.js');

/*
 * POST handle posts.
 */
exports.index_post = function(req, res) {

	var users_ip = req.header('x-forwarded-for') || req.connection.remoteAddress;

	//Split post into words.
	var str = req.body.post_content
		,	str_parts = str.split(' ')
		,	tags = []
		,	adds = [];

	function pushPost() {

		//POST to mongo
		console.log('posted now!');
		new Post({
				post: req.body.post_content
			,	user_ip: users_ip
			, 	tags: tags
			,	adds: adds
			}).save();
		
		//POST to user feed	
		Post.find({post: req.body.post_content, user_ip: users_ip}).sort({date: -1}).limit(1).exec(function(error, my_post) {
			res.render('post', {
				posts_array: my_post
			});
	   	});

	}

	function findTokens(source, callback) {
		var isQuery = 0;
		var query = '';
		for (i = 0; i < source.length; i++) {
			var value = source[i];
			//console.log("word" + i + ":" + source[i]);
			
			if (isQuery == 0) {

				if (value.charAt(0).match(/#/)) {
					tags.push(value); //located tag
					console.log('pushed tag: ' + value);
				}
				else if (value.charAt(0).match(/@/)) {
					adds.push(value); //located address
					console.log('pushed add: ' + value);
				}
				else if (value.charAt(0).match(/\?/)) {
					if (i == 0) {
						console.log('found query');
						query = value;
						isQuery = 1;
					}
					else {
						console.log('found query include!');
						query = value;
						isQuery = 1;
					}
				}

			}

			else {

				if (value.charAt(value.length - 1).match(/\?/)) {
					query = query + ' ' + value;
					console.log('end of query');
					console.log(query);
				}
				else {
					query = query + ' ' + value;
				}

			}

		}
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

	//initialize feed
	if (action == 'initialize') {
		Post.find().sort({date: -1}).limit(10).exec(function(error, posts) {
			
			for(i = 0; i < posts.length; i++) {
				if (posts[i].user_ip != users_ip) {
					posts[i].spriteID = '/images/guest_b.png';
				}
			}

			res.render('post', {
				posts_array: posts
			});
		});
	}

	//poll
	else if (action == 'poll') {
		var last_poll = req.body.date;
		Post.find({date: {$gt: last_poll}, user_ip: {$ne: users_ip}}).count().exec(function(error, new_posts) {
			res.json(new_posts);
		});
	}

	//update feed
	else if (action == 'update_feed') {
		var last_poll = req.body.date;
		Post.find({date: {$gt: last_poll}, user_ip: {$ne: users_ip}}).exec(function(error, posts) {

			console.log(posts);

			for(i = 0; i < posts.length; i++) {
				if (posts[i].user_ip != users_ip) {
					posts[i].spriteID = '/images/guest_b.png';
				}
			}

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
