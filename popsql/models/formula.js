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
};

/*
 *	global variables
 */

var http = require('http')
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
		console.log('api_name: ' + api_name);
		_f['recipe'](req, function() { //construct api request
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

	brew: function(req, callback) {
		//
	}, //end
};