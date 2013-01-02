/*
 * Module Functions
 */

var _f = {

	classify: function (i, req, res) { //recursive
		if (i < req.length) {
			_f['is_class'](req[i], function (err, is_class) {
				if (err) { //no class
					console.log(err);
					_f['classify'](i + 1, req, res); //recurse
				}
				else { //has class
					if (is_class['resource']) {
						resources = [is_class['resource']];
					}
					if (is_class['method']) {
						methods = [is_class['method']];
					}
					if (is_class['response']) {
						responses = [is_class['response']];
					}
					_f['classify'](i + 1, req, res); //recurse
					//response = [];
				}
			});
		}
		else {
			if (resources[0] && methods[0]) {
				return res(null, true); //returns true -> formula
			}
			else {
				return res(new Error('Cannot classify')); //returns err -> formula
			}
		}
	}, //end

	is_class: function (req, res) {
		if (req == 'nfl') { //nfl
			return res(null, { resource: '/sports/football/' + req }); //returns resource -> classify
		}
		else if (req == 'nba') { //nba
			return res(null, { resource: '/sports/basketball/' + req }); //returns resource -> classify
		}
		else if (req == 'wnba') { //wnba
			return res(null, { resource: '/sports/basketball/' + req }); //returns resource -> classify
		}
		else if (req == 'mlb') { //mlb
			return res(null, { resource: '/sports/baseball/' + req }); //returns resource -> classify
		}
		else if (req == 'nhl') { //nhl
			return res(null, { resource: '/sports/hockey/' + req }); //returns resource -> classify
		}
		else if (req == 'mma') { //mma
			return res(null, { resource: '/sports/' + req }); //returns resource -> classify
		}

		else if (req.match('headline') || req.match('news')) { //headline(s)
			return res(null, { 
			method: '/news/headlines'
		,	response: 'headlines' 
			}); //returns method -> classify
		}
		else {
			return res(new Error('\"' + req + '\" has no class.'));
		}
	}, //end

	headlines: function (req, res) {
		var str = 'Top 5 Headlines: <ol type=\'1\'>';
		for (var i = 0; i <  5; i++) {
			str += '<li><a target=\'_blank\' href=\'' + req[i]['links']['web']['href'] + '\'>' + req[i]['headline'] + '</a></li>';
		}
		str += '</ol>'
		return res (null, str);
	}, //end
}

/*
 * Module Dependencies
 */

,	City = require('../models/city.js') //city schema
,	Learn = require('../models/learn.js') //learn module

/*
 * Module Variables
 */

,	v = ['/v1']
,	resources = []
,	methods = []
,	post = ['?_accept=application/json?limit=5&apikey=gfjqc3h67r5vzs8kr3wkhdh6']
,	responses = []
;

module.exports = {
	answer: function (req, res) {
		console.log('answer:');

		var answer = ''
		,	d = req['data']
		,	err = d['status']
		,	expiration = { units: 'h', value: 24}
		;

		if (err != 'success') {
			answer = d['message'];
		}
		else { //needs to be async recursive.
			console.log(err);
			for (var i = 0; i < req['formula']['res'].length; i++) { //construct answer
				console.log('headline:');
				var cond = req['formula']['res'][i]
				switch (cond) {
					case 'headlines':
						console.log('headline:');
						_f['headlines'](req['data']['headlines'], function (err, str) {
							if (err) {
								answer = 'err';
							}
							else {
								answer = str;
							}
						});
						//answer = req['data']['headlines'][0]['headline'];
						break;
				}
			}
		}
		answer = answer.trim(); //trim leading and trailing whitespace

		return res({ 
			post: answer
		,	new_expires: expiration
		}); //returns answer -> formula/blender
	}, //end

	formula: function (req, res) {
		//req = search { query: q_parts }
		console.log('formula:');
		resources = []
	,	methods = []
	,	responses = []; //reset

		_f['classify'](0, req, function (err, callback) {
			console.log('responses: ' + responses);

			if (err) {
				console.log(err);
				return res(err); //returns err -> formula/has_key
			}
			else {
				return res(null, {
					source: {
						author: 'ESPN'
					,	handle: '@ESPN'
					,	user_ip: '69.88.128.222'
					,	spriteID: '/images/espn-pop.png'
					},
					formula: {
						name: 'espn'
					,	host: 'api.espn.com'
					,	path: v
					,	req: resources.concat(methods, post)
					,	res: responses
					}
				}); //returns formula update params -> formula/has_key
			}
		});
	},
}