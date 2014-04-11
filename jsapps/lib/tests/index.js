var tests = [];

tests.push( require('./WebRTCTest'));
tests.push( require('./SignalingServerTest'));
tests.push( require('./WebserverTest'));

module.exports = tests;