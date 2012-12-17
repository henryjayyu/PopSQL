var Search = require('../models/search.js');

function indexQuery(req, res) {
	if (i < req.queries.length) {
		Search.findOne( { query: /req.queries[i]/i } ).exec(function (result) {
			if (result == undefined) {
				addQuery();
			}
			else {
				if (result.response == undefined && result.formula == false) { //no answer
					Search.update( { _id: result._id },{ $inc: { poll: 1 }} ).exec(function (callback) {
						return res('no answer');
					});
				}
				else if (result.response != undefined && result.formula == true) { //formula answer
					return res({
						formula: true
					, 	response: response
					});
				}
				else { //static answer
					return res({ 
						formula: false
					, 	response: response 
					});
				}
			}
		});
	}
}

module.exports = {
	process: function(req, res) {
		var i = 0;
		L
		console.log(req.queries.length);
			return res();
	}
};