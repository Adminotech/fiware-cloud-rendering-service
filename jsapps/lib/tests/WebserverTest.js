function Test(scope) {
	var test = {};
	test.category = 'Webserver';
	test.tests = [
		{ name: 'Webserver assets', success: 'Loaded', test: function(scope){ return window.hasOwnProperty('CloudRenderingClient'); } }
	]
	return test;
}

module.exports = Test;