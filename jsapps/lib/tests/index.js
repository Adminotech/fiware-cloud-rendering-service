var tests = [];

tests.push( require('./WebserverTest'));
tests.push( require('./SignalingServerTest'));
tests.push( require('./WebRTCTest'));

module.exports = tests;