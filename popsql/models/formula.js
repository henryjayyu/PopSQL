/*
 *	module functions
 */

var _f = {
	recipe: function (req, res) {
		options['host'] = req['host']
	,	options['path'] = req['path'];
		var req_args = req['req'] //request arguments
		for (var i = 0; i < req_args.length; i++) { //constructs api path with request arguments
			options.path += req_args[i];
		}
		return res(true); //returns -> module['use']		
	}, //end

	blender: function (req, res) {
		var Formulas = require('../apis/' + api_name + '.js'); //variable formula

		Formulas['answer'](req, function (answer) { //construct answer
			return res(answer) //returns answer -> module['use']
		});
	}, //end

	has_keys: function (req, res) { //need to recurse
		//req = search { query: }
		var	keys = [];
		_f['q_parts'](req, function (q_parts) {
			for (var i = 0; i < q_parts.length; i++) { //identify api key
				switch (q_parts[i]) {
					case 'weather':
						keys.push('theweatherchannel');
						break;

					
					case 'nfl': case 'nba': case 'wnba': case 'mlb': case 'nhl': case 'mma':
						keys.push('espn');
						break;
					
				}

				if (i == q_parts.length - 1) {
					if (keys[0] == undefined) {
						return res(new Error('No api-keys found.')); //returns err -> concoct
					}
					else {
						return res(null, keys); //returns keys -> concoct
					}
				}
			}
		});

	}, //end

	manage_keys: function (req, keys, res) {
		//req = search { query: }
		console.log('manage_keys:');
		if (keys.length >= 1) {
			_f['scrub_keys'](keys, function (unique_keys) {
				if (unique_keys.length > 1) {
					return res(new Error('Cannot yet support multiple api-keys.'));
				}
				else {
					_f['use_keys'](0, req, unique_keys, function (err, formula) {
						if (err) {
							return res(err); //returns err -> concoct
						}
						else {
							return res(null, formula); //returns formula -> concoct
						}
					});				
				}
			});
		}
	}, //end

	use_keys: function (i, req, keys, res) { //can recurse
		//req = search { query: }
		console.log('use_keys:');
		_f['q_parts'](req, function (q_parts) {
			if (i < keys.length) {
				api_name = keys[i]; //define api_name
				_f['get_formulas'](api_name, function (get_formulas) { //get module
					get_formulas['formula'](q_parts, function (err, formula) {
						if (err) {
							return res(err); //returns err -> manage_keys
						}
						else {
							return res(null, formula); //returns formula -> manage_keys
						}
					});
				});
			}
		});
	}, //end

	scrub_keys: function (req, res) {
		console.log('scrub_keys:');
		var keys = req
		, 	unique_keys = keys.filter(function (elem, pos) {
	    	return keys.indexOf(elem) == pos;
		});
		return res(unique_keys); //returns unique_keys -> manage_keys
	}, //end

	get_formulas: function (req, res) {
		//req = api_name
		return res(require('../apis/' + req + '.js'));
	}, //end

	q_parts: function (req, res) {
		//req = search { query: }
		req = req.replace(/\?/g, ''); //remove wrapper
		var parts = req.split(/ /); //split query into array of parts
		return res(parts);
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
	use: function (req, callback) {
		api_name = req['name']; //set api name
		console.log(api_name);
		_f['recipe'](req, function () { //construct api request
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
					}, function (answer) {
						return callback(answer); //returns answer -> queryHandler/handle_response 
					});
				});
			}).end(); //closes http request
		});
	}, //end

	concoct: function(req, res) {
		//req = search { _id:, query:, source: {}, }
		console.log('concoct start:');
		_f['has_keys'](req['query'], function (err, keys) {
			if (err) {
				return res(err); //returns err -> queryHandler/handle_response
			}
			else { //update query source & formula
				_f['manage_keys'](req['query'], keys, function (err, formula) {
					if (err) {
						return res(err); //returns err -> queryHandler/handle_response
					}
					else {
						console.log('update formula:');
						console.log(formula['formula']['name']);
						var s = formula['source']
						,	f = formula['formula'];

						Search.update({
							_id: req['_id']
						},{	$set: {
								has_formula: true
							,	source: {
									author: s['author']
								,	handle: s['handle']
								,	user_ip: s['user_ip']
								,	spriteID: s['spriteID']
								}
							,	formula: {
									name: f['name']
								,	host: f['host']
								,	path: f['path']
								,	req: f['req']
								,	res: f['res'] 
								} 
						}}).exec(function () { //get answer
							module.exports['use'](f, function (answer) {
								return res(null, answer); // returns answer -> queryHandler/handle_response
							});
						});
					}
				});
			}
		});
	}, //end
};