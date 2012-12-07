
/*
 * POST handle posts.
 */

var Post = require('../models/post.js');
var mongoose = require('mongoose');

exports.index_post = function(req, res) {
	new Post({post: req.body.post_content}).save();

	Post.findOne({post: req.body.post_content}, function(error, post) {
		res.render('post', {postID: post.thread, spriteID: '/images/guest.png', post_time: post.date, post_content: post.post});
    });
}

/*
 * GET home page.
 */

exports.index = function(req, res){

	Post.find(function(error, posts) {
		res.render('index', {title: 'Popsql', posts_array: posts});
	});
};

/*
 *	GET about us page.
 */

exports.index_aboutus = function(req, res){
	res.render('aboutus', { title: 'About Us'});
};
