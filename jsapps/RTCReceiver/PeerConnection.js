'use strict';
var Message = require('../../signalingserver/lib/CRMessage');

function PeerConnection(client, servers) {
  this.client = client;
  this.servers = servers || null;
  this.videoElement = null;
  this.channel = false;
}

PeerConnection.prototype.initiatePeerConnection = function() {
  this.pc = new webkitRTCPeerConnection(this.servers, { optional: [ {DtlsSrtpKeyAgreement: true}, { RtpDataChannels: true } ] });

  this.pc.onicecandidate = this.onIceCandidate.bind(this);
  this.pc.onaddstream = this.initiateVideoElement.bind(this);
  this.pc.ondatachannel = this.onDataChannel.bind(this);
  this.pc.onsignalingstatechange = this.onStateChange.bind(this);

  // this.createOffer();
};

PeerConnection.prototype.startRendererPeerConnection = function() {
  this.pc = new webkitRTCPeerConnection(this.servers);

  this.pc.onicecandidate = this.onIceCandidate.bind(this);
  this.pc.onstatechange = this.onStateChange.bind(this);
  this.pc.onsignalingstatechange = this.onStateChange.bind(this);
  this.pc.oniceconnectionstatechange = this.onStateChange.bind(this);
  this.pc.ondatachannel = this.onDataChannel.bind(this);

  this.createStream();
  // this.createOffer();
};

PeerConnection.prototype.onDataChannel = function( event ){
  var channel = this.channel = event.channel

  console.log('Data channel', event);
  window.channel = this.channel;

  channel.onopen = function () {
        // e.g. enable send button
        console.log('Channelopen', channel);
  };

  channel.onmessage = function (evt) {
        console.log('Channel message', evt.data);
  };
};

PeerConnection.prototype.onStateChange = function(event) {
  if (event.target.signalingState === 'stable' && event.target.iceConnectionState === 'connected') {
    // console.log('\n\n\n\n\n\nState Changed', event.type, event, '\n\n\n\n\n\n\n\n\n\n\n');
    // this.onOpen();
  }
};

PeerConnection.prototype.onOpen = function() {
  console.log('PEER CONNECTION OPENED');
};

PeerConnection.prototype.createStream = function() {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  navigator.getUserMedia({
      video: true
    },
    this.gotStream.bind(this),
    function(error) {
      console.log('navigator.getUserMedia error: ', error);
    });
};

PeerConnection.prototype.gotStream = function(stream) {
  console.log('Got stream', this);

  this.initiateVideoElement({
    stream: stream
  });
  this.pc.addStream(stream);
  this.pc.createOffer(this.gotLocalDescription.bind(this));
};

PeerConnection.prototype.initiateVideoElement = function(event) {
  console.info('Videoelement', event);
  this.containerElement = document.querySelector('.video');
  this.videoElement = document.createElement('video');
  this.videoElement.src = URL.createObjectURL(event.stream);
  this.containerElement.appendChild(this.videoElement);

  this.videoElement.play();
};

// PeerConnection.prototype.createOffer = function(){
//     this.pc.createOffer( this.gotLocalDescription.bind(this) );
// };

PeerConnection.prototype.onOffer = function(message) {
  var data, sdp, ices;
  data = message.getDataProp('sdp');
  sdp = new RTCSessionDescription( data );

  console.info('Adding sdp', data);
  this.pc.setRemoteDescription(sdp);

  ices = message.getDataProp('iceCandidates');
  for (var i = 0; i < ices.length; i++) {
    var ice = ices[i];
    this.gotRemoteIceCandidate(ice);
  }
  this.pc.createAnswer(this.sendAnswer.bind(this));
};

PeerConnection.prototype.sendAnswer = function(description) {
  console.info('Sending answer', description);
  this.pc.setLocalDescription(description);
  this.client.send(new Message('Signaling', 'Answer', {
    sdp: description
  }).toJSON());
};

PeerConnection.prototype.gotLocalDescription = function(description) {
  console.info('This is Sdp', description);

  this.pc.setLocalDescription(description);
  this.client.send(new Message('Signaling', 'Offer', {
    sdp: {
      data: description.sdp,
      type: description.type
    }
  }).toJSON());
};

PeerConnection.prototype.onAnswer = function(message) {
  var data, sdp, ices;
  data = message.getDataProp('sdp');
  sdp = new RTCSessionDescription({
    sdp: data.data,
    type: data.type
  });

  console.info('Adding sdp');
  this.pc.setRemoteDescription(sdp);

  ices = message.getDataProp('iceCandidates');
  if (ices.length !== 0) {
    console.info('Ices included');
  }
  for (var i = 0; i < ices.length; i++) {
    var ice = ices[i];
    this.gotRemoteIceCandidate(ice);
  }
};

PeerConnection.prototype.onIceCandidate = function(event) {
  if (event.candidate) {
    var message = new Message('Signaling', 'IceCandidates', {
      iceCandidates: [ event.candidate ]
    });
    console.log('This is ice', message.toString());
    this.client.send(message.toJSON());
  }
};

PeerConnection.prototype.gotRemoteIceMessage = function(message) {
  console.log('icemessage', message.toString());
  var ices = message.getDataProp('iceCandidates');
  for (var i = 0; i < ices.length; i++) {
    var ice = ices[i];
    this.gotRemoteIceCandidate(ice);
  }
};

PeerConnection.prototype.gotRemoteIceCandidate = function(candidate) {
  this.pc.addIceCandidate(new RTCIceCandidate( candidate ));
};

module.exports = PeerConnection;
