
/*
 * GET home page.
 */

exports.index_postback = function(req, res){
	var postID = 1;
	var post_content = req.body.post_content;
	res.render('index', {title: 'Popsql', postID: postID, post_content: post_content});
};

exports.index = function(req, res){
	res.render('index', { title: 'Popsql'});
};

