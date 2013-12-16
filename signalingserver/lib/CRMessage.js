function Message(channel, type, data) {
    this.message = {};
    this.message.channel = channel;
    this.message.message = {};
    this.message.message.type = type;
    this.message.message.data = data;
}
Message.prototype.setObject = function(message){
    this.message = message;
};
Message.prototype.getObject = function(){
    return this.message;
};
Message.prototype.parse = function( data ){
    var parsed;
    try {
        parsed = JSON.parse( data );
    } catch( err ){
        console.warn('CRMessage Error: Parsing JSON failed', data);
        return false;
    }

    if (!parsed.hasOwnProperty('channel') ||
        !parsed.hasOwnProperty('message') ||
        !parsed.message.hasOwnProperty('type') ||
        !parsed.message.hasOwnProperty('data')
    ){
        console.warn('CRMessage Error: Required fields not present');
        return false;
    }

    this.message = parsed;

    return this;
};
Message.prototype.setChannel = function( channel ){
    this.message.channel = channel;
};
Message.prototype.getChannel = function(){
    return this.message.channel;
};
Message.prototype.setType = function( type ){
    this.message.message.type = type;
};
Message.prototype.getType = function(){
    return this.message.message.type;
};
Message.prototype.setData = function( data ){
    this.message.message.data = data;
};
Message.prototype.getData = function(){
    return this.message.message.data;
};
Message.prototype.getDataAsString = function(){
    return JSON.stringify( this.getData() );
};
Message.prototype.getMessage = function(){
    return this.message.message;
};
Message.prototype.resetContent = function(){
    this.message.message.type = null;
    this.message.message.data = null;
};
Message.prototype.toString = function(){
    return this.getChannel() + '|' + this.getType()  + ': ' + this.getDataAsString();
};
Message.prototype.toJSON = function(){
    return JSON.stringify(this.message);
};

Message.prototype.getDataProp = function(prop){
    if (this.message.message.data.hasOwnProperty(prop)){
        return this.message.message.data[prop];
    } else {
        return false;
    }
};
Message.prototype.setDataProp = function(prop, data){
    this.message.message.data[prop] = data;
};

module.exports = Message;

