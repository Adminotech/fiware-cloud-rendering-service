'use strict';
var WebSocketServer = require('ws').Server,
  Connection        = require('./lib/Connection'),
  Message           = require('./lib/CRMessage'),
  RoomsPool         = require('./lib/RoomsPool'),
  log4js            = require('log4js'),
  server            = require('../webservice/app'),
  wss               = new WebSocketServer( { server: server }),
  roomsPool         = new RoomsPool();

log4js.replaceConsole();
console.info('Signaling server started');

wss.on('connection', function(socket) {
  console.info('New connection');
  var con = new Connection(socket, roomsPool);

  socket.on('message', function(data) {
    var message;

    // Parse JSON messages. Close connection after 4 sequential non-JSON messages.
    message = new Message().parse(data);

    if (message === false) {
      con.warn();
    } else {
      con.resetWarnings();
    }

    // Handle message, if connection has registered it's type
    if (con.hasType()) {
      con.onMessage(message);
    } else if (isRegistrationMessage(message)) {
      con.setType(message);
    } else {
      console.log('Registration failed');
      con.close();
    }
  });

  socket.on('close', function() {
    con.leaveRoom();
  });
});

function isRegistrationMessage(message) {
  var registrant = false;
  console.log('Start register check', message.toString());
  if (message.getType() !== 'Registration') {
    return false;
  }
  console.log('Is RegisterMessage, getting registrar type');
  try {
    registrant = message.getDataProp('registrant');
  } catch (err) {
    // No such key
    return false;
  }
  console.log('Registrant type is: ', registrant);
  return registrant === 'client' ||  registrant === 'renderer';
}
