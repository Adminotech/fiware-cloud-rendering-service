var Client = require('./Client'),
    Renderer = require('./Renderer'),
    Message = require('./CRMessage');

function Connection (socket, roomsPool) {
    this.warnings = 0;
    this.socket = socket;
    this.roomsPool = roomsPool;
    this.type = false;
    this.messageHandler = false;
}

Connection.prototype.setType = function( message ){
    this.type = message.getData().registrant; // 'client' or 'renderer';
    if (this.type === 'client'){
        this.messageHandler = new Client( this, this.roomsPool );
    } else {
        this.messageHandler = new Renderer( this, this.roomsPool );
    }
    this.onMessage( message );
};

Connection.prototype.leaveRoom = function(){
    if (!!this.messageHandler){
        this.messageHandler.leaveRoom();
    }
};

Connection.prototype.hasType = function(){
    return this.type !== false;
};

Connection.prototype.onMessage = function( message ){
    if (typeof this.messageHandler !== void(0)){
        this.messageHandler.onMessage( message );
    } else {
        console.log('No messageHandler is set');
    }
};

Connection.prototype.warn = function(){
    this.warnings += 1;
    if (this.warnings > 3){
        // this.send(new Message('Application'))
        this.close();
    }
};

Connection.prototype.resetWarnings = function(){
    this.warnings = 0;
};

Connection.prototype.close = function(){
    this.socket.close();
};

module.exports = Connection;
