
module.exports = { 
	handle: function(post, users_ip, callback) {
		for (var i = 0; i < post.length; i++) {
			if (post[i].spriteID != '/images/host.png' && post[i].user_ip != users_ip) {
				post[i].spriteID = '/images/guest_b.png';
			}
		}
		return callback(post);
	}
};