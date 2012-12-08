//Globals
var mongoose = require('mongoose');

//Global Models
var Post = require('../models/post.js');

/*
 * POST handle posts.
 */
exports.index_post = function(req, res) {

	//Gen1 Analysis
	var str = req.body.post_content;
	var str_parts = str.split(' ');
	var tags = [];
	var adds = [];

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
		post: req.body.post_content, 
		tags: tags,
		adds: adds
	}).save();
		
	Post.findOne({post: req.body.post_content}, function(error, post) {

		//publish ISODate
		function ISODate(date) {
			return date.toISOString();
		}

		res.render('post', {
			postID: post.thread, 
			spriteID: '/images/guest.png', 
			post_date: ISODate(post.date), 
			post_content: post.post,
			tags: post.tags,
			adds: post.adds
		});
    });

}

/*
 * GET poll.
 */

exports.index_poll = function(req, res){
	var last_poll = req.body.date;
	Post.find({date: {$gt: last_poll}}).count().exec(function(error, new_posts) {
		res.json(new_posts);
	});
};

/*
 * GET home page.
 */

exports.index = function(req, res){

	Post.find().sort({date: -1}).limit(10).exec(function(error, posts) {
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
