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
					body.push(is_class);
					response = ['temp', 'weather', 'location'];
					return res(null, true); //returns true -> formula
				}
			});
		}
		else {
			return res(new Error('Cannot classify')); //returns true -> formula
		}
	}, //end

	is_class: function (req, res) {
		if (req.length == 5 && isNaN(req) == false) { //is zip
			console.log(req + ': is zip');
			return res(null, req + '/'); //returns zip -> classify
		}
		else if (req.charAt(0).match(/#/)) { //is #city
			t_city = req.replace(/#/, ''); //scrub token
			t_city = t_city.toLowerCase(); //normalize
			City.findOne({
				name: t_city
			}).exec(function (err, city) {
				if (err) {
					return res(err);
				}
				else {
					if (city) {
						return res(null, city['state'] + '/' + city['name'] + '/'); //returns city -> classify
					}
					else {
						return res(new Error(t_city + ' is not recognized')); //returns err -> classify
					}
				}
			});
		}
		else {
			return res(new Error('\"' + req + '\" has no class.'));
		}
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

,	pre = ['conditions/', 'q/']
,	body = []
,	post = ['.json']
,	response = []
;

module.exports = {
	answer: function (req, res) {
		console.log('answer:');

		var answer = ''
		,	err = req['data']['response']['error']
		,	expiration = { units: 'h', value: 24}
		;

		if (err != undefined) {
			answer = err['description'];
		}
		else {
			var d = req['data']['current_observation']
		,	l = d['display_location'];
			
			Learn['city']({
				name: ((l['city']).replace(/ /g, '_')).toLowerCase() 
			,	state: (l['state']).toLowerCase()
			,	zip: l['zip']
			}, function (callback) {
				console.log(callback);
			});

			for (var i = 0; i < req['formula']['res'].length; i++) { //construct answer
				var cond = req['formula']['res'][i]
				switch (cond) {
					case 'temp':
						answer += d['temperature_string'] + ' ';
						break;

					case 'weather':
						answer += 'and ' + d['weather'] + ' ';
						break;

					case 'location':
						answer += 'in ' + d['display_location']['full'] + ' ';
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
		body = []
	,	response = []; //reset

		_f['classify'](0, req, function (err, callback) {
			if (err) {
				console.log(err);
				return res(err); //returns err -> formula/has_key
			}
			else {
				return res(null, {
					source: {
						author: 'The Weather Channel'
					,	handle: '@theweatherchannel'
					,	user_ip: '38.102.136.104'
					,	spriteID: '/images/twc-pop.png'
					},
					formula: {
						name: 'theweatherchannel'
					,	host: 'api.wunderground.com'
					,	path: '/api/8bacae0472865331/'
					,	req: pre.concat(body, post)
					,	res: response
					}
				}); //returns formula update params -> formula/has_key
			}
		});
	},
}