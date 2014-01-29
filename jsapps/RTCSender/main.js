'use strict';

var WebSocket = require('ws'),
  $ = require('jquery-browserify'),
  Message = require('../../signalingserver/lib/CRMessage'),
  loremIpsum = require('lorem-ipsum'),
  PeerConnectionHandler = require('../lib/PeerConnection'),
  ControlsHandler = require('../lib/ControlsHandler'),
  argv = require('querystring').parse(window.location.search.substr(1));

function Renderer( options ) {

  this.defaults = {
    host: 'ws://' + window.location.host
  };

  this.type = 'renderer';
  this.options = options ||  this.defaults;

  this.peerId = false;

  this.socket = new WebSocket(this.options.host);

  this.socket.onopen = this.onopen.bind(this);
  this.socket.onmessage = this.onmessage.bind(this);
  this.socket.onclose = this.onclose.bind(this);

  var servers = {
    'iceServers': [
      { 'url': 'stun:stun.l.google.com:19302' },
      { 'url': 'turn:130.206.83.161:3478' }
    ]
  };

  this.peerConnection = new PeerConnectionHandler(this.socket, servers, this);
}

Renderer.prototype.RTCsend = function( data ){
  if ( this.peerConnection.channel ) {
    var message = new Message( 'Application', 'PeerCustomMessage');
    message.setData( { payload: data } );
    this.peerConnection.channel.send( message.toJSON() );
  }
};

Renderer.prototype.onopen = function() {
  var data = {
    registrant: this.type
  };

  var m = new Message('State', 'Registration', data);
  console.log('Sending Registration');
  this.socket.send(m.toJSON());
};

Renderer.prototype.sendMessage = function(message) {
  console.log('sending: ', message.toString());
  var peerMessages = ['Offer', 'Answer', 'IceCandidates'];
  if ( peerMessages.indexOf( message.getType() ) > -1 && this.peerId ){
    console.log('SETTING PEER ID', this.peerId);
    message.setDataProp('receiverId', this.peerId);
  }
  this.send(message.toJSON());
};

Renderer.prototype.send = function(string) {
  this.socket.send(string);
};

Renderer.prototype.onmessage = function(data) {
  var message = new Message().parse(data.data);
  if (!message) {
    console.log('MessageParsingError');
    return false;
  }

  switch (message.getChannel()) {
    case 'State':
      break;
    case 'Room':
      this.roomMessageHandler(message);
      break;
    case 'Application':
      this.applicationMessageHandler(message);
      break;
    case 'Signaling':
      this.signalingMessageHandler(message);
      break;
    default:
      console.log('No messageHandler for:', message.toString());
  }
};

Renderer.prototype.onclose = function() {};

Renderer.prototype.signalingMessageHandler = function(message) {
  console.log('Got', message.toString());
  if (message.getType() === 'Answer') {
    this.peerConnection.onAnswer(message);
  }
  if (message.getType() === 'IceCandidates') {
    this.peerConnection.gotRemoteIceMessage(message);
  }
  if (message.getType() === 'Offer') {
    this.peerConnection.onOffer(message);
  }
};

Renderer.prototype.applicationMessageHandler = function(message) {
  var payload = message.getDataProp('payload'), element;

  if (payload.hasOwnProperty('message')) {
    //Do nothing
  }

  if (payload.hasOwnProperty('introduction') && payload.hasOwnProperty('senderId')) {
    //Do nothing
  }

  if (payload.hasOwnProperty('serverStatus')) {
    //Do nothing
  }

};

Renderer.prototype.roomMessageHandler = function(message) {
  if (message.getType() === 'RoomUserJoined') {
    var ids = message.getDataProp('peerIds');
    if (ids.length > 0 && this.peerId == false){
      this.peerId = ids[0];
      console.log('this.peerId', this.peerId);
      this.peerConnection.startRendererPeerConnection();
    }
  }
  if (message.getType() === 'RoomAssigned') {
    if (message.getDataProp('error') === 0) {
      this.peerId = message.getDataProp('peerId');
      this.roomId = message.getDataProp('roomId');

      var roomLink = document.createElement('a');
      roomLink.innerHTML = 'Room Id: ' + this.roomId;
      roomLink.href = window.location.protocol + '//' + window.location.host + window.location.pathname + '?room=' + this.roomId;
      document.body.appendChild(roomLink);

      this.peerConnection.initiatePeerConnection();
    }
  }
  console.log(message.toString());
};

module.exports = Renderer;
var renderer = new Renderer(); // jslint ignore:line
