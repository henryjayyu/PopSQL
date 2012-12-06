
/*
 * GET home page.
 */

exports.index_postback = function(req, res){
	var post_data = req.body.post_content;
	var postID = 1;
	var spriteID = '/images/guest.png';
	var post_time = Date.now();
	var post_content = req.body.post_content;
	
	res.render('post', {postID: postID, spriteID: spriteID, post_time: post_time, post_content: post_content});
};

exports.index = function(req, res){
	res.render('index', { title: 'Popsql'});
};

