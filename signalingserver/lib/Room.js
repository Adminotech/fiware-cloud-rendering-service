var uuid = require('node-uuid'),
    Message = require('./CRMessage'),
    __ = require('underscore'),
    SignalingHandler = require('./SignalingHandler');

function Room( renderer, authHandler, pool ){
    this.id = uuid.v4();
    this.pool = pool;
    this.clients = [];
    this.renderer = false;

    if (typeof authHandler !== undefined){
        this.authHandler = authHandler;
    }

    this.autoIncrement = (function(){
        var id = 0;
        function increment(){
            id++;
            return id;
        }
        return increment;
    })();

    this.signalingHandler = new SignalingHandler(this);
    this.clientSignalingHandler = this.signalingHandler.clientSignalingHandler.bind(this.signalingHandler);
    this.rendererSignalingHandler = this.signalingHandler.rendererSignalingHandler.bind(this.signalingHandler);

    if (renderer !== false){
        console.info('Room created with renderer');
        this.addRenderer( renderer );
    } else {
        console.info('Room created without renderer');
    }

    console.info( 'Created new room:', this.id);

    this.statusInterval = setInterval(this.sendStatusMessage.bind(this), 3000);
}

Room.prototype.sendStatusMessage = function(){
    var status = {
        poolStatus: this.pool.getStatus(),
        roomStatus: this.getStatus()
    }

    var message = new Message( 'Application', 'RoomCustomMessage', { payload: { serverStatus: status } });
    message.setDataProp('receivers', __(this.clients).pluck('peerId'));

    this.distributeMessage( message, { peerId: 'server'} );
};

Room.prototype.getStatus = function(){
    var status = {
        clients: this.clients.length,
        renderer: !!this.renderer
    }
    return status;
};

Room.prototype.distributeMessage = function(message, client){
    client = client || { peerId: 'server' };
    // Add sender info to data;
    var data = message.getDataProp('payload');
    data.senderId = client.peerId;
    message.setDataProp('payload', data);

    if (!message.getDataProp('receivers')){
        this.broadcast( message, client );

        if (this.renderer !== false){
            this.renderer.send( message.toJSON() );
        }

    } else {
        var clients = this.getClients( message.getDataProp('receivers') );

        for (var i = clients.length - 1; i >= 0; i--) {
            clients[i].send( message.toJSON() );
        }
    }
};
Room.prototype.getClient = function( peerId ){
    var c = __(this.clients).find( function( client ) { return parseInt(client.peerId) === parseInt(peerId); } );
    return c;
};

Room.prototype.getClients = function(idArray){
    var clients =  this.clients.filter( function( client ){
        return idArray.indexOf( client.peerId ) !== -1;
    });
    return clients;
};

Room.prototype.addClient = function( message, client ){
    console.info('Adding Client to room:', this.id);
    if (this.isFull()){
        return false;
    }

    client.peerId = this.autoIncrement();
    this.clients.push( client );

    // Send userJoined message to everybody
    this.distributeMessage( new Message('Room', 'RoomUserJoined', { peerIds: [ client.peerId ] }), client );
    // Send userJoined message about everybody to client;

    client.send( new Message('Room', 'RoomUserJoined', { peerIds: __(this.clients).pluck('peerId') }).toJSON() );

    return true;
};

Room.prototype.removeClient = function( client ){
    this.distributeMessage( new Message('Room', 'RoomUserLeft', { peerIds: [ peerId ] }) );

    var peerId = client.peerId;

    var index = this.clients.indexOf( client );
    this.clients.splice(index, 1);

    return true;
};

Room.prototype.addRenderer = function( renderer ) {
    console.info('Renderer Assigned to room');
    if (this.renderer === false){
        this.renderer = renderer;
        this.signalingHandler.assignRenderer( renderer );

        renderer.send( new Message('Room', 'RoomUserJoined', { peerIds: __(this.clients).pluck('peerId') }).toJSON() );

        return this;
    }
};

Room.prototype.removeRenderer = function( renderer ) {
    this.renderer = false;
    this.signalingHandler.removeRenderer();
}

Room.prototype.isFull = function(){
    return false;
};
Room.prototype.broadcast = function( message, client ){
    console.info('Broadcasting message', message.toString());
    for (var i = this.clients.length - 1; i >= 0; i--) {
        this.clients[i].send( message.toJSON() );
    }
};
Room.prototype.isAuthenticated = function( message, client){
    this.authHandler.isAuthenticated(message, client);
};
Room.prototype.isAuthorized = function( message, client){
    this.authHandler.isAuthorized(message, client);
};
Room.prototype.authHandler = {
    isAuthenticated: function(){
        return true;
    },
    isAuthorized: function(){
        return true;
    }
};
Room.prototype.purge = function(){
    this.pool = false;
    this.clients = false;
    this.renderer = false;

    clearInterval(this.statusInterval);

};
Room.prototype.isActive = function(){
    return (this.clients.length > 0);
};

module.exports = Room;

