
/*
 * GET home page.
 */

exports.index_postback = function(req, res){
	var new_post = req.body.user_post;
	res.render('index', {title: 'Popsql', new_post: new_post});
};

exports.index = function(req, res){
	res.render('index', { title: 'Popsql'});
};

