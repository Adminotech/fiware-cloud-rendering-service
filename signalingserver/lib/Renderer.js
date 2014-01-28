'use strict';
var uuid = require('node-uuid'),
  Message = require('./CRMessage');

function Renderer(connection, pool) {
  this.id = uuid.v4();
  this.state = 2;
  this.peerId = 'renderer';
  this.rooms = pool;
  this.connection = connection;
  this.onMessage = this.channelsHandler.bind(this);
  this.room = null;
}

Renderer.prototype.channelsHandler = function(message) {
  console.log('Renderer message receiver: ', message.toString());
  if (!this.messageHandlers.hasOwnProperty(message.getChannel())) {
    this.generalMessageHandler(message);
    return false;
  }

  var handler = this[this.messageHandlers[message.getChannel()]].bind(this);
  handler(message, this);
};

Renderer.prototype.generalMessageHandler = function(message) {
  console.log('No handler for this message', message);
};

Renderer.prototype.applicationMessageHandler = function(message, scope) {
  scope = scope || this;
  if (message.getType() === 'RoomCustomMessage') {
    scope.room.distributeMessage(message, scope);
  }
};

Renderer.prototype.roomMessageHandler = function(message, scope) {
  scope = scope || this;
  if (message.getType() === 'RoomCustomMessage') {
    scope.room.broadcast(message, scope);
  }
};

Renderer.prototype.signalingMessageHandler = function(message, scope) {
  this.room.rendererSignalingHandler(message, scope);
};

Renderer.prototype.stateMessageHandler = function(message, scope) {
  if (message.getType() === 'Registration') {
    if (message.getDataProp('createPrivateRoom') === true) {
      this.room = scope.rooms.createRoomForRenderer(scope);
    } else {
      this.room = scope.rooms.addToRendererQue(scope);
    }
  }
  if (message.getType() === '') {}

};

Renderer.prototype.messageHandlers = {
  'Application': 'applicationMessageHandler',
  'Room': 'roomMessageHandler',
  'Signaling': 'signalingMessageHandler',
  'State': 'stateMessageHandler'
};

Renderer.prototype.leaveRoom = function() {
  if ( !! this.room) {
    this.room.removeRenderer(this);
    this.rooms = undefined;
    this.room = undefined;
    this.connection = undefined;
    this.channelsHandler = undefined;
  }
};

Renderer.prototype.states = {
  1: {
    state: 'OFFLINE',
    message: 'Renderer is offline, new Renderers should not be redirected here.'
  },
  2: {
    state: 'ONLINE',
    message: 'Renderer is online and ready to server new Renderers.'
  },
  3: {
    state: 'FULL:',
    message: 'Renderers Renderer limit has been reached, no new Renderers should be redirected here.'
  }
};

Renderer.prototype.send = function(messageString) {
  this.connection.socket.send(messageString, function(error) {
    if (error !== undefined) {
      console.warn('Error sending message to Renderer', error);
    }
  });
};

Renderer.prototype.kill = function(message) {
  if (message !== undefined) {
    this.send(message.toJSON());
  }
  this.connection.socket.close();
};


module.exports = Renderer;