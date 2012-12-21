var http = require('http');

var options = {
	method: 'GET'
,	header: { 'Content-Type': 'application/json' }
}

function constructor(req, res) { //construct api request
	options.host = req['host']
,	options.path = req['path'];

	for (var i = 0; i < req['req'].length; i++) {
		options.path += req['req'][i];
	}

	return res(true);
}

function blender(req, res) {
	var name = req['formula']['name']; //formula name

	Formulas[name](req, function (callback) { //calls formula by name
		return res(callback);
	});

}

// set up the possible functions:
var Formulas = {

  theweatherchannel: function (req, res) {
  	var str = ''
  	,	exp = { units: 'h', value: 24} //expires every 24h
	;
  	
  	for(var i = 0; i < req.formula.res.length; i++) { //construct response
  		var cond = req['formula']['res'][i]; 
  		switch (cond) {
  			case 'temp':
	  			str += req['data']['current_observation']['temperature_string'] + ' ';
	  			break;

	  		case 'weather':
	  			str += 'and ' + req['data']['current_observation']['weather'] + ' ';
	  			break;

	  		case 'location':
	  			str += 'in ' + req['data']['current_observation']['display_location']['full'] + ' ';
	  			break;
  		}
  	}
  	return res({ post: str, new_expires: exp });
  },

};


module.exports = {
	process: function(formula, res) {
		constructor(formula, function() { //construct api request
			http.request(options, function (data) { //get api request
				var str = '';
				data.on('data', function (chunk) { //construct api response
					str += chunk;
				});
				data.on('end', function() { //parse api response
					parsed_return = JSON.parse(str);
					blender({ formula: formula, data: parsed_return }, function (callback) { //construct response
						return res(callback);
					});
				});
			}).end();
		});
	}, //end
};