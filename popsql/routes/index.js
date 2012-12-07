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
		if (value.match(/#/)) {
			tags.push(value);
		}
		else if (value.match(/@/)) {
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
		res.render('post', {
			postID: post.thread, 
			spriteID: '/images/guest.png', 
			post_time: post.date, 
			post_content: post.post,
			tags: post.tags,
			adds: post.adds
		});
    });

}

/*
 * GET home page.
 */

exports.index = function(req, res){

	Post.find().sort({date: -1}).limit(10).exec(function(error, posts) {
		res.render('index', {
			title: 'Popsql',
			posts_array: posts
		})
	});

};

/*
 *	GET about us page.
 */

exports.index_aboutus = function(req, res){
	res.render('aboutus', { title: 'About Us'});
};
