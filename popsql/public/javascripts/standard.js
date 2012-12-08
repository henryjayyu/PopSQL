var HTTP_HOST = getBaseURL();

function getBaseURL() {
	return location.protocol + "//" + location.hostname + (location.port && ":" + location.port) + "/";
}


$(document).ready(function() {

	//services
	$('abbr.timeago').timeago();
	
	cLimit('#cmdLine_parent', 'textarea[name=post_content]', 'span[data-name=popbox_label]', '#popbox_submit', 140);

	//poll
	var last_poll = Date.now();
	window.setInterval(
		function() {
			var options = {
				url: '/poll',
				type: 'POST',
				data: {date: last_poll},
				success: function(data) {
					if(data) {
						alert(data);
					}
				},
			};

			$(this).ajaxSubmit(options);

		}, 10000);

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
					$('#feed').prepend(data);
					$('.post').fadeIn();
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