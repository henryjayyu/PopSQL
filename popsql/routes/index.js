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

	//Split post to find tokens.
	var str = req.body.post_content
		,	str_parts = str.split(' ')
		,	tags = []
		,	adds = [];

	//Find Tokens
	str_parts.forEach(isToken);

	function isToken(value, index, array) {
		if (value.charAt(0).match(/#/)) {
			tags.push(value);
			console.log('pushed token: ' + value);
		}

		else if (value.charAt(0).match(/@/)) {
			adds.push(value);
		}
	}

	if (tags.length > 0) {
		tags.forEach(hasRoute);
	}
	else {
		console.log(tags.length);
		postReady(); //escape
	}

	function hasRoute(value, index, array) {
		Library.findOne( { keywords: value } ).exec(function(error, volume) {
			if (volume.routes.length > 0) {
				//console.log(volume);
				for (i = 0; i < volume.routes.length; i++) {
					tags.push(volume.routes[i]);
					console.log('pushed route:' + volume.routes[i]);
				}
			}
			else {
				console.log('No Routes');
			}
		});

		postReady();
	}

/*
			new Library({
				team: 'Packers'
			,	location: ['Green Bay','WI']
			,	conf: 'NFC'
			,	league: 'NFL'
			,	sport: 'Football'
			,	keywords: ['#packers', '#green_bay']
			,	routes: ['#football', '#nfl', '#nfc', '#nfc-north']
			}).save();
*/

	

	function postReady() {

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
