//Globals
var mongoose = require('mongoose');

//Global Models
var Post = require('../models/post.js');

/*
 * POST handle posts.
 */
exports.index_post = function(req, res) {

	//Gen1 Analysis
	var str = req.body.post_content
		,	str_parts = str.split(' ')
		,	tags = []
		,	adds = [];

	function isToken(value, index, array) {
		if (value.charAt(0).match(/#/)) {
			tags.push(value);

			if (value == '#packers') {
				tags.push('#nfl');
			}

		}
		else if (value.charAt(0).match(/@/)) {
			adds.push(value);
		}
	}

	str_parts.forEach(isToken);

	//POST to mongo
	new Post({
			post: req.body.post_content
		,	user_ip: req.body.user_ip
		, 	tags: tags
		,	adds: adds
		}).save();
	
	//POST to user feed	
	Post.findOne({post: req.body.post_content}).exec(function(error, my_post) {
		res.render('post', {
			posts_array: my_post
		});
		console.log(my_post);
   	});

};

/*
 * GET poll.
 */

exports.index_poll = function(req, res){
	var last_poll = req.body.date;
	var users_ip = req.body.user_ip;
	Post.find({date: {$gt: last_poll}, user_ip: {$ne: users_ip}}).count().exec(function(error, new_posts) {
		res.json(new_posts);
	});
};

/*
 * GET home page.
 */

exports.index = function(req, res){

	Post.find().sort('-date').limit(10).exec(function(error, posts) {
		res.render('index', {
			title: 'Popsql',
			posts_array: posts
		});
	});

};

/*
 *	GET about us page.
 */

exports.index_aboutus = function(req, res){
	res.render('aboutus', { title: 'About Us'});
};
