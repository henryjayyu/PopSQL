//Globals
var mongoose = require('mongoose');

//Global Models
var Post = require('../models/post.js');
var Library = require('../models/library.js');
var Search = require('../models/search.js');

//REST Models
//var Weather = require('http://api.wunderground.com/api/8bacae0472865331/conditions/q/CA/San_Francisco.json');

/*
 * GET home page.
 */

exports.index = function(req, res){

	res.render('index', {
			title: 'Popsql'
	});

};

/*
 *	GET about us page.
 */

exports.index_aboutus = function(req, res){
	res.render('aboutus', { title: 'About Us'});
};
