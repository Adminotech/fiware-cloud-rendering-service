var Room = require('./Room'),
    Message = require('./CRMessage'),
    __ = require('underscore'),
    util = require('util'),
    exec = require('child_process').exec;

function RoomsPool() {
     this.rooms = [];
     this.renderers = [];

     var that = this;
     this.assignRendererInterval = setInterval( function(){ that.assignRenderer(); }, 10000);
     this.purgeRoomsInterval = setInterval( function(){ that.purgeRooms(); }, 10000);
}

RoomsPool.prototype.requestRoom = function( message, client ){
    var room,
        rid = message.getDataProp('roomId'),
        roomError = {
            NoError:       0, // = No errors, roomId should be set to a valid id.
            ServiceError:  1, // = Room could not be server, internal service error.
            DoesNotExist:  2, // = Requested room id does not exist. Send new request without room id to create a new room.
            Full:          3, // = Requested room is full, try again later.
        };

    if (!rid){
        room = this.createRoom();
        this.rooms.push( room );
    } else {
        room = this.getRoomById( rid );
    }

    if(!room){
        this.sendRoomAssignedMessage( client, roomError['DoesNotExist']);
        client.kill();
        return false;
    }

    if (room.addClient( message, client )){
        this.sendRoomAssignedMessage( client, roomError['NoError'], room.id );
    } else {
        this.sendRoomAssignedMessage( client, roomError['Full']);
    }

    return room;
};

RoomsPool.prototype.getStatus = function() {
    var status = {
        rooms: this.rooms.length,
        renderers: this.renderers.length
    }
    return status;
};

RoomsPool.prototype.createRoom = function( renderer, authHandler) {
    if (renderer === undefined){
        renderer = this.getRendererFromQue();
    }
    return new Room( renderer, authHandler, this );
};


RoomsPool.prototype.createRoomForRenderer = function( renderer ) {
    return this.createRoom( renderer );
};

RoomsPool.prototype.getRendererFromQue = function(){
    var renderer = this.renderers.pop();
    if (renderer === undefined){
        this.launchRendererWithOptions();
        return false;
    }
    return renderer;
};

RoomsPool.prototype.addToRendererQue = function( renderer ){
    // Add renderer to needy room or put it in a que;
    var room = __(this.rooms).find(function(room) { return room.renderer === false; });
    if (room !== undefined){
        return room.addRenderer( renderer );
    } else {
        this.renderers.push( renderer );
        return false;
    }
};

RoomsPool.prototype.sendRoomAssignedMessage = function(client, error, rid){
    this.sendRoomMessage(client, 'RoomAssigned', { roomId: rid, peerId: client.peerId, error: error});
};

RoomsPool.prototype.sendRoomMessage = function(client, type, data){
    var message = new Message('Room', type, data);
    client.send(message.toJSON());
};

RoomsPool.prototype.roomExists = function(rid){
    return this.rooms.some( function(room) { return room.id === rid; });
};

RoomsPool.prototype.launchRendererWithOptions = function( options ){
    var execStr = '',
        defaults = {
        executable: 'RocketConsole.exe',
        path: 'C:\\Users\\pasiaj\\Desktop\\cloudrendering\\',
        options: {
            plugin: 'CloudRenderingPlugin',
            cloudRenderer: 'localhost:8080',
            loglevel: 'debug'
        }
    };

    options = __(defaults).extend(options);

    execStr += options.path + options.executable;

    for (var op in options.options){
        execStr += ' --' + op + ' ' + options.options;
    }

    function puts(error, stdout, stderr) { util.puts(stdout); }
    exec(execStr, puts);
};

RoomsPool.prototype.getRoomById = function(rid){
    // TODO: Replace the Array.filter+flatten with an Array.find() -implementation.
    var room,
        rooms = this.rooms.filter( function(room) { return room.id === rid; });

    if (rooms.length === 0){
        room = false;
    } else {
        room = rooms[0];
    }
    return room;
};

RoomsPool.prototype.assignRenderer = function(){

};

RoomsPool.prototype.purgeRooms = function(){
    console.info('purgin rooms');
    // Go through all rooms and remove them if there is no activity.
    for (var i = this.rooms.length - 1; i >= 0; i--) {
        var room = this.rooms[i];
        if (!room.isActive()){
            room.purge();
            this.rooms.splice(i, 1);
        }
        room = undefined;
    }
};

module.exports = RoomsPool;
