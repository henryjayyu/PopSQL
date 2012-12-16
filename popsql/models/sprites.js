
module.exports = { 
	handle: function(req1, req2, initialize) {
		data = req1
	,	users_ip = req2;
		for (var i = 0; i < data.length; i++) {
			if (data[i].spriteID != '/images/host.png' && data[i].user_ip != users_ip) {
				data[i].spriteID = '/images/guest_b.png';
			}
		}
		return initialize(data);
	}
};