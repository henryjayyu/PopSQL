/*
 *	module functions
 */

var _f = {
	recipe: function(req, res) {
		options['host'] = req['host']
	,	options['path'] = req['path'];
		var req_args = req['req'] //request arguments
		for (var i = 0; i < req_args.length; i++) { //constructs api path with request arguments
			options.path += req_args[i];
		}
		return res(true); //returns -> module['use']		
	}, //end

	blender: function(req, res) {
		var Formulas = require('../apis/' + api_name + '.js'); //variable formula

		Formulas['answer'](req, function (callback) { //construct answer
			return res(callback) //returns answer -> module['use']
		});
	}, //end

	has_key: function(req, res) {
		req = req.replace(/\?/g, ''); //remove wrapper
		q_parts = req.split(/ /); //split query into array of parts
		for (var i = 0; i < q_parts.length; i++) { //identify api key
			switch (q_parts[i]) {
				case 'weather':
					api_name = 'theweatherchannel'; //declare api name
					_f['get_formulas'](api_name, function (get_formulas) { //get module require
						get_formulas['formula'](q_parts, function (err, formula) { //get formula
							if (err) {
								return res(err); //returns err -> concoct
							}
							else {
								return res(null, formula); //returns formula['req'] -> concoct
							}
						});
					});
					break;
			}
			if (i == q_parts.length) { //break
				return res(new Error('No api_key'));
			}
		}
	}, //end

	get_formulas: function(req, res) {
		return res(require('../apis/' + req + '.js'));
	}, //end
};

/*
 *	global variables
 */

var http = require('http')
,	Search = require('../models/search.js') //search schema
,	options = {
		method: 'GET'
	,	header: {
			'Content-Type': 'application/json'
		}
	}
,	api_name = '';

module.exports = {
	use: function(req, callback) {
		api_name = req['name']; //set api name
		console.log(api_name);
		_f['recipe'](req, function() { //construct api request
			console.log(options);
			http.request(options, function (data) {
				var str = ''; //data string
				data.on('data', function (chunk) { //add chunk to data string
					str += chunk;
				});
				data.on('end', function () { //parse data
					parsed_json = JSON.parse(str);
					_f['blender']({
						formula: req
					,	data: parsed_json
					}, function (blended) {
						return callback(blended); //returns answer -> queryHandler/handle_response 
					});
				});
			}).end(); //closes http request
		});
	}, //end

	concoct: function(req, callback) {
		//req = search { _id:, query:, source: {}, }
		_f['has_key'](req['query'], function (err, res) {
			if (err) {
				return callback(err); // returns err -> queryHandler/handle_response
			}
			else { //update query source & formula
				var formula = res['formula']
				,	source = res['source'];

				Search.update({
					query: req['query']
				},{	$set: {
						has_formula: true
					,	source: {
							'author': source['author']
						,	'handle': source['handle']
						,	'user_ip': source['user_ip']
						,	'spriteID': source['spriteID']
						}
					,	formula: {
							'name': formula['name']
						,	'host': formula['host']
						,	'path': formula['path']
						,	'req': formula['req']
						,	'res': formula['res'] 
						} 
					}}).exec(function () { //get answer
					module.exports['use'](res['formula'], function (data) {
						return callback(null, data); // returns answer -> queryHandler/handle_response
					});
				});
			}
		});
		
	}, //end
};