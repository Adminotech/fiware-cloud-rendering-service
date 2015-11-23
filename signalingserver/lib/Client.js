'use strict';
var uuid = require('node-uuid');

function Client(connection, pool) {
  this.id = uuid.v4();
  this.rooms = pool;
  this.connection = connection;
  this.onMessage = this.channelsHandler.bind(this);
  this.room = null;
}

Client.prototype.messageHandlers = {
  'Application': 'applicationMessageHandler',
  'Room': 'roomMessageHandler',
  'Signaling': 'signalingMessageHandler',
  'State': 'stateMessageHandler'
};

Client.prototype.generalMessageHandler = function(message) {
  console.log('No handler for this message', message);
};

Client.prototype.applicationMessageHandler = function(message, scope) {
  scope = scope || this;
  if (scope.room && message.getType() === 'RoomCustomMessage') {
    scope.room.distributeMessage(message, scope);
  }
};

Client.prototype.roomMessageHandler = function(message, scope) {
  scope = scope || this;
  if (message.getType() === 'RoomCustomMessage') {
    scope.room.broadcast(message, scope);
  }
};

Client.prototype.signalingMessageHandler = function(message, scope) {
  scope.room.clientSignalingHandler(message, scope);
  console.log([message.getType(), message.getData()]);
};

Client.prototype.stateMessageHandler = function(message, scope) {
  // Client only has Registeration Message Type
  if (message.getType() !== 'Registration') {
    return false;
  }

  // Create a new room for the client, or put him in a new room.
  scope.room = scope.rooms.requestRoom(message, scope);
};

Client.prototype.send = function(jsonString) {
  this.connection.socket.send(jsonString, function(error) {
    if (error !== undefined) {
      console.warn('Error sending message to client', error);
    }
  });
};

Client.prototype.kill = function(message) {
  if (message !== undefined) {
    this.send(message.toJSON());
  }
  this.connection.socket.close();
};

Client.prototype.leaveRoom = function() {
  if ( !! this.room) {
    this.room.removeClient(this);
    this.rooms = null;
    this.room = null;
  }
};

Client.prototype.channelsHandler = function(message) {
  if (!this.messageHandlers.hasOwnProperty(message.getChannel())) {
    this.generalMessageHandler(message);
    return false;
  }

  var handler = this[this.messageHandlers[message.getChannel()]];
  handler(message, this);
};

module.exports = Client;