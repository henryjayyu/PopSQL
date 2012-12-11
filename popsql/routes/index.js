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

	//Gen1 Analysis
	var str = req.body.post_content
		,	str_parts = str.split(' ')
		,	tags = []
		,	adds = [];

	function isToken(value, index, array) {
		if (value.charAt(0).match(/#/)) {
			tags.push(value);

			new Library({
				team: '49ers'
			,	city: 'San Francisco'
			,	state: 'CA'
			,	conf: 'NFC'
			,	league: 'NFL'
			,	sport: 'Football'
			,	tokens: [ 
				'#49ers'
			,	'#san_francisco'
			,	'#CA'
			,	'#nfc'
			,	'#nfl'
			,	'football'
			]
			}).save();

/*
			function isChild(value) {
				Library.findOne( { tokens: value } ).exec(function(error, volume) {
					console.log("debug:" + value);
				});
			}

			if (isChild(value)) {
				for (i = 0; i < tokens.length; i++) {
					console.log(token[i]);
				}
			}
*/

/*
			if (value == '#packers') {
				tags.push('#nfl');
			}
*/
		}
		else if (value.charAt(0).match(/@/)) {
			adds.push(value);
		}
	}

	str_parts.forEach(isToken);

	//POST to mongo
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
