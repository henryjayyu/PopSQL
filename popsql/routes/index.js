
/*
 * GET home page.
 */

exports.index_postback = function(req, res){
	var new_title = req.body.user_post;
	res.render('index', {title: new_title});
};

exports.index = function(req, res){
	res.render('index', { title: 'Popsql'});
};

