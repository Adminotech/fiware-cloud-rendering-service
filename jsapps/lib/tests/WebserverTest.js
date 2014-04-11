function Test(scope) {
	var test = {};
	test.category = 'Webserver';
	test.tests = [
		{ name: 'Web Client assets', success: 'Loaded', test: function(scope){ return window.hasOwnProperty('CloudRenderingClient'); } }
	]
	return test;
}

module.exports = Test;