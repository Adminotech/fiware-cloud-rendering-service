function keyIsOfValue(object, objectPath, value){
	var parts = objectPath.split('.');
	for (var i = 1; i < parts.length; i++) {
		console.log(parts[i], object, objectPath);
		if ( !object.hasOwnProperty( parts[i] )) {
			return false;
		};
		object = object[parts[i]];
	};

	return object == value;
}

function Test(scope) {
	var test = {};
	test.category = 'Signaling Server';
	test.tests = [
		{ name: 'Signaling Messages', success: 'Coming in', test: function(){ return keyIsOfValue( scope, 'scope.signalingMessages', 1) } },
		{ name: 'Application messages', success: 'Working', test: function(){ return keyIsOfValue( scope, 'scope.applicationMessages', 1) } },
		{ name: 'Websocket connection', success: 'Established', test: function(){ return keyIsOfValue( scope, 'scope.socket.readyState', 1) } }
	];
	return test;
}

module.exports = Test;