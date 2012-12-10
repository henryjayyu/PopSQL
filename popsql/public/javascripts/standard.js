var HTTP_HOST = getBaseURL();

function getBaseURL() {
	return location.protocol + "//" + location.hostname + (location.port && ":" + location.port) + "/";
}


$(document).ready(function() {

	//services
	$('abbr.timeago').timeago();
	
	cLimit('#cmdLine_parent', 'textarea[name=post_content]', 'span[data-name=popbox_label]', '#popbox_submit', 140);

	//initialize posts
	$.post('/postback', {
			action: 'initialize'
	}, function(data) {
		if(data) {
			$('.feed').prepend(data);
			$('.feed').fadeIn();
			//reset
			$('abbr.timeago').timeago();
		}
	});

	//poll
	var last_poll = new Date();
	window.setInterval(
		function() {
			$.post('/postback', {
					action: 'poll'
				,	date: last_poll
			}, function(data) {
				if (data > 0) {
					$('.new_posts').attr('value', data + " New Posts").slideDown(200);
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

	//update feed
	$('#feed').on('click', '.new_posts',
		function() {
			$.post('/postback', {
					action: 'update_feed'
				,	date: last_poll 
			}, function(data) {
				if (data) {
					$('.feed').prepend(data);
					//reset
					$('.new_posts').slideUp(200, function() {
						last_poll = new Date();
						$('abbr.timeago').timeago();
					});
				}
			});
		});

	//cmdLine Post
	$('#cmdLine_parent').on('submit', '#cmdLine',
		function() {

			//AJAX
			var options = {
				url: '/post',
				success: function(data) {
					$('textarea[name=post_content]').attr('value','');
					$('.feed').prepend(data);
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
				if (allowance <= 0) {
					$(label).attr('style', 'color: red');
					$(action).attr('disabled', 'disabled');
				}
				else if (allowance == 140) {
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