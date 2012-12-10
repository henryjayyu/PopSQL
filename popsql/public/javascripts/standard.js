var HTTP_HOST = getBaseURL();

function getBaseURL() {
	return location.protocol + "//" + location.hostname + (location.port && ":" + location.port) + "/";
}


$(document).ready(function() {

	//services
	$('abbr.timeago').timeago();
	
	cLimit('#cmdLine_parent', 'textarea[name=post_content]', 'span[data-name=popbox_label]', '#popbox_submit', 140);

	//get user_ip
	var user_ip = '';
	$.getJSON("http://jsonip.appspot.com?callback=?",
		function(data){
			$('input[name=user_ip]').attr('value', data.ip);
			user_ip = data.ip;
		});

	//poll
	var last_poll = new Date();
	window.setInterval(
		function() {
			$.post('/poll', {
					date: last_poll
				,	user_ip: user_ip
			}, function(data) {
				if(data > 0) {
					$('.new_posts').attr('value', data + " New Posts").slideDown();
				}
			});

		}, 20000);

	//hotkeys (currently only adds character to end)
	$('#cmdLine_parent').on('click', '.hotkey',
		function() {
			var val = $('textarea[name=post_content]').attr('value');
			var token = $(this).attr('value');
			$('textarea[name=post_content]').attr('value', val + token).focus();
		});

	//cmdLine Post
	$('#cmdLine_parent').on('submit', '#cmdLine',
		function() {

			//AJAX
			var options = {
				url: '/',
				success: function(data) {
					$('textarea[name=post_content]').attr('value','');
					$('.feed').prepend(data);
					$('.feed').fadeIn();
					//reset
					$('abbr.timeago').timeago();
				},
			};

			$(this).ajaxSubmit(options);
			return false;
		});

	//character limit
	function cLimit(parent, input, label, action, limit) {
		$(parent).on('keyup', input, 
			function() {
				var allowance = (limit - $(input).val().length);
				//manage label and submit
				if(allowance <= 0) {
					$(label).attr('style', 'color: red');
					$(action).attr('disabled', 'disabled');
				}
				else {
					$(label).removeAttr('style');
					$(action).removeAttr('disabled');
				}
				$(label).html(allowance);
			});
	}
});