var HTTP_HOST = getBaseURL();

function getBaseURL() {
	return location.protocol + "//" + location.hostname + (location.port && ":" + location.port) + "/";
}

$(document).ready(function() {

	//say hello
	alert('Hello World');

});