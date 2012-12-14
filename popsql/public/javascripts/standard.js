var HTTP_HOST = getBaseURL();

function getBaseURL() {
	return location.protocol + "//" + location.hostname + (location.port && ":" + location.port) + "/";
}

function addPosts(data) {
	var posts = '';
	for (i = 0; i < data.length; i++) {
		var postID = data[i]._id
		,	spriteID = data[i].spriteID
		,	post_author = data[i].author
		,	post_date = data[i].date
		,	post_content = handleQuery(data[i].post)
		,	tags = data[i].tags
		,	adds = data[i].adds
		,	addTags = addTokens(tags, 'Tags')
		,	addAdds = addTokens(adds, 'Addresses')
		,	newPost = "<div class='post' data-postID=\'" + postID + "\'>" + "<div class='sprite'>" + "<img src=\'" + spriteID + "\'>" + "</div>" + "<div class='body'>" + "<h1>" + post_author + "&nbsp;</h1>" + "<h2>@guest</h2>" + "<abbr class='timeago' title=\'" + post_date + "\'></abbr>" + "<p>" + post_content + "</p>" + "<h3>" + addTags +	addAdds + "</h3>" +	"</div>" + "</div>";
		posts += newPost;
	}
	return posts;
}

function handleQuery(content) {
	if (content.match('<query>')) {
		content = content.replace(/<query>/g, "<span class='query'>");
		content = content.replace(/<\/query>/g, "</span>");
	}
	return content;
}

function addTokens(token, arg) {
	var product = '';
	if (token[0]) {
		product = product + "<span id=\'" + arg + "\'>" + arg + ":&nbsp;";
		for (j = 0; j < token.length; j++) {
			var addToken = "<a>" + token[j] + "</a>&nbsp;";
			product = product + addToken;
		}
	}
	return product;				
}

$(document).ready(function() {

	var socket = io.connect(HTTP_HOST);

	//initialize feed
	socket.on('connected', function (data) {
		if(data) {
			var posts = addPosts(data);
			$('.feed').prepend(posts);
			$('.feed').fadeIn();
			//reset
			$('abbr.timeago').timeago();
		}
	});

	//services
	$('abbr.timeago').timeago();
	
	cLimit('#cmdLine_parent', 'textarea[name=post_content]', 'span[data-name=popbox_label]', '#popbox_submit', 140);

	//Post
	$('#cmdLine_parent').on('submit', '#cmdLine',
		function() {

			socket.emit('userPost', {
				content: $('textarea[name=post_content]').attr('value')	
			});

			socket.on('receipt', function(data) {
				$('textarea[name=post_content]').attr('value','');
			});

			return false;
		});

	//poll
	socket.on('newPost', function (data) {
		alert(data);
	});

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
					var post = isQuery(data);
					$('.feed').prepend(post);
					//reset
					$('.new_posts').slideUp(200, function() {
						last_poll = new Date();
						$('abbr.timeago').timeago();
					});
				}
			});
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