module.exports = { 
	callback: function(req, data) {
		console.log("this is req: " + req);

		return data("something");
	}
};