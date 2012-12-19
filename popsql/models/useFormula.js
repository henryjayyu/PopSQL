var http = require('http');

var options = {
	method: 'GET'
,	header: { 'Content-Type': 'application/json' }
}

// set up the possible functions:
var Formulas = {
  wunderground: function (req, res) {
  	console.log('this is ');
  	return res(true);
  },
};
// execute the one specified in the 'funcToRun' variable:

function constructor(req, res) {
	options.host = req['header']['host']
,	options.path = req['header']['path'];

	for (var i = 0; i < req['arg'].length; i++) {
		options.path += req['arg'][i];
	}

	return res(true); 
}

function blender(req, res) {
	var formula = req['formula']['formula'];

	Formulas[formula](req, function (callback) {
		console.log('so cool!');
	});

}

module.exports = {
	process: function(formula, response) {
		constructor(formula, function() {
			http.request(options, function (data) {
				var str = '';
				data.on('data', function (chunk) {
					str += chunk;
				});
				data.on('end', function() {
					parsed_return = JSON.parse(str);
					blender({ formula: formula, data: parsed_return }, function (callback) {
						console.log('done!');
					});
				});
			}).end();
		});
	}
};