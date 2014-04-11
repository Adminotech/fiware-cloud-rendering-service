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
	test.category = 'WebRTC';
	test.tests = [
		// { name: 'WebRTC connection', success: 'Established', test: function(scope){ return scope.hasOwnProperty('peerConnection') && scope.peerConnection.hasOwnProperty('pc')  } },
		{ name: 'WebRTC connection', success: 'Established', test: function(){ return keyIsOfValue(scope, 'scope.peerConnection.pc.iceConnectionState', 'connected')  } },
		{ name: 'Video Channel', success: 'Established', test: function(){ return keyIsOfValue(scope, 'scope.peerConnection.videoStream', 1) } },
		{ name: 'Data Channel', success: 'Established', test: function(){ return keyIsOfValue(scope, 'scope.peerConnection.channel.readyState', 1) } }

	]
	return test;
}

module.exports = Test;

