var _f = {
	is_class: function(req, res) {
		if (req.length == 5 && isNaN(req) == false) { //is zip
			return res({'zip': req});
		}
		else {
			return res('err');
		}
	}, //end
};

module.exports = {
	answer: function (req, res) {
		console.log('answer:');
		var answer = ''
		,	expiration = { units: 'h', value: 24}
		;

		for (var i = 0; i < req['formula']['res'].length; i++) { //construct answer
			var cond = req['formula']['res'][i]
			,	data = req['data'];
			switch (cond) {
				case 'temp':
					answer += data['current_observation']['temperature_string'] + ' ';
					break;

				case 'weather':
					answer += 'and ' + data['current_observation']['weather'] + ' ';
					break;

				case 'location':
					answer += 'in ' + data['current_observation']['display_location']['full'] + ' ';
					break;
			}
		}
		answer = answer.trim(); //trim leading and trailing whitespace
		
		return res({ 
			post: answer
		,	new_expires: expiration
		}); //returns answer -> formula/blender

	}, //end

	formula: function (req, res) {
		console.log('formula:');
		var pre = []
		,	body = []
		,	post = ['.json']
		,	f_res = [];

		for (var i = 0; i < req.length; i++) {
			var cond = req[i];
			switch (cond) {
				case 'weather':
					pre.push('conditions/', 'q/');
					break;

				default:
					_f['is_class'](req[i], function (is_class) {
						if (is_class['zip']) {
							if (body[0] == undefined) { //limits input
								body.push(is_class['zip'] + '/');
								f_res = ['temp', 'weather', 'location'];
							}
						}
					});
					break;
			}
		}

		if (body[0] != undefined) {
			return res(null
			, { source: {
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
				,	res: f_res
				}
			}); //returns formula update params -> formula/has_key
		}
		else {
			return res(new Error('No Formula')); // returns err -> formula/has_key
		}
	},
}