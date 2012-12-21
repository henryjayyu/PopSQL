module.exports = {
	answer: function (req, res) {
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
}