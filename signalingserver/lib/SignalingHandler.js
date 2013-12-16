var Message = require('./CRMessage'),
    __ = require('underscore');

function SignalingHandler( room ){
    this.room = room;
    this.offers = [];
    this.iceCandidates = [];
    this.rendered = false;
}

SignalingHandler.prototype.clientSignalingHandler = function(message, client) {
    if (message.getType() === 'Offer'){
        this.onClientOffer(message, client);
    }
    if (message.getType() === 'Answer'){
        this.onClientAnswer(message, client);
    }
    if (message.getType() === 'IceCandidates'){
        this.onClientIceCandidate(message, client);
    }
};

SignalingHandler.prototype.rendererSignalingHandler = function(message) {
    console.log('Renderer: ', message.toString());
    if (message.getType() === 'Answer'){
        this.onRendererAnswer(message);
    }
    if (message.getType() === 'IceCandidates'){
        this.onRendererIceCandidate(message);
    }
    if (message.getType() === 'Offer'){
        this.onRendererOffer(message);
    }
};

SignalingHandler.prototype.onClientAnswer = function(message, client) {
    message.setDataProp('senderId', client.peerId);
    this.renderer.send( message.toJSON() );
};

SignalingHandler.prototype.onRendererOffer = function(message) {
    var peerId = message.getDataProp('receiverId');
    var client = this.room.getClient(peerId);

    console.log('Client', client);

    if (client !== undefined){
        console.log('Sending ices to client');
        client.send( message.toJSON() );
    } else {
        console.warn( 'SignalingHandler: Wrong PeerId in Renderer Offer:', message.getDataProp('receiverId'), message.toString());
    }
};

SignalingHandler.prototype.onClientOffer = function( message, client ){
    var offer = this.creteSignalingMessage(message, client);
    this.offers.push(offer);
    if (this.renderer){
        console.log( 'PEER ID: ', offer.getDataProp('receiverId') );
        this.renderer.send( offer.toJSON() );
    }
};

SignalingHandler.prototype.onClientIceCandidate = function( message, client ){
    var ice = this.creteSignalingMessage(message, client);
    this.iceCandidates.push(ice);
    console.log('PUSHING ICE CANDIDATES');
    if (this.renderer){
        console.log( 'PEER ID: ', ice.getDataProp('senderId'));
        this.renderer.send( ice.toJSON() );
    }
};

SignalingHandler.prototype.onRendererIceCandidate = function( message ){
    var peerId = message.getDataProp('receiverId');
    var client = this.room.getClient(peerId);
    if (client !== undefined){
        console.log('Sending ices to client');
        client.send( message.toJSON() );
    } else {
        console.warn( 'SignalingHandler: Wrong PeerId in Renderer IceCandidate:', message.getDataProp('receiverId'), message.toString());
    }
};

SignalingHandler.prototype.onRendererAnswer = function( message ){
    console.info('Answer', message.getDataProp('receiverId'), message.toString() );
    var peerId = message.getDataProp('receiverId');
    var client = this.room.getClient(peerId);
    console.log(client);
    if (client !== false){
        client.send( message.toJSON() );

    } else {
        console.warn( 'SignalingHandler: Wrong PeerId in Answer: ', message.getDataProp('receiverId'), message.toString());
    }
};

SignalingHandler.prototype.removeRenderer = function(){
    this.renderer = undefined;
};

SignalingHandler.prototype.assignRenderer = function( renderer ){
    this.renderer = renderer;
    renderer.room = this.room;

    for (var i = this.offers.length - 1; i >= 0; i--) {
        console.info('Sending offers');
        var offer = this.offers.pop();
        // var ices = __(this.iceCandidates).filter( function(ice) { return ice.getDataProp('peerId') === offer.getDataProp('peerId'); } );
        // var smushed = [];
        // for (var j = 0; j < ices.length; j++) {
        //     var ice = ices[i];
        //     smushed.push( ice.getDataProp('iceCandidates')[0]);
        // }
        // offer.setDataProp('iceCandidates', smushed);
        this.renderer.send( offer.toJSON() );
    }
    for (var i = this.iceCandidates.length - 1; i >= 0; i--) {
        console.log('Sending ices');
        var ice = this.iceCandidates.pop();
        this.renderer.send( ice.toJSON() );
    }
};

SignalingHandler.prototype.creteSignalingMessage = function( message, client ) {
    var sm = new Message().parse( message.toJSON() );
    if (client !== undefined){
        sm.setDataProp('senderId', client.peerId);
    }
    return sm;
};

module.exports = SignalingHandler;
