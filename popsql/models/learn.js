var City = require('../models/city.js') //city schema

module.exports = {
	city: function (req, res) {
		City.findOne({
			name: req['name']
		}).exec(function (err, search) {
			if (err) {
				return res(err);
			}
			else {
				if (search) {
					return res('Already know this city.');
				}
				else {
					new City({
						name: req['name']
					,	state: req['state']
					,	zip: req['zip']
					}).save(function (err, callback) {
						if (err) {
							return res(err);
						}
						else {
							return res('Learned ' + callback['name']);
						}
					})
				}
			}
		});
	}
};