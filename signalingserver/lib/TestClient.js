var WebSocket = require('ws'),
    Message = require('./CRMessage'),
    loremIpsum = require('lorem-ipsum'),
    argv = require('optimist').argv;


var ws = new WebSocket('ws://localhost:8080');

var testClient = new TestClient();

ws.on('open', function() {
    var data = { registrant: 'client' };
    if (argv.room){
        data.roomId = argv.room;
    }

    console.log('parameters', data);

    var m = new Message('State', 'Registration', data );
    console.log('Sending Registration');
    ws.send(m.toJSON());
});
ws.on('message', function(data){
    var message = new Message().parse(data);
    if (!message){
        console.log('MessageParsingError');
        return false;
    }
    switch (message.getChannel()){
        case 'State':
            console.log('Got: ', message.toString());
            break;
        case 'Room':
            roomMessageHandler( message );
            break;
        case 'Application':
            applicationMessageHandler( message );
            break;
        case 'Signaling':
            console.log('Got: ', message.toString());
            break;
        default:
            console.log('No messageHandler for:', message.toString());
    }
});
ws.on('close', function(){
});

if (argv.talk){
    setInterval(function(){
        var lorem = loremIpsum( {
                        count: 1,
                        units: 'sentences',
                        sentenceLowerBound: 2,
                        sentenceUpperBound: 7
                    });
        sendMessage( new Message( 'Application', 'RoomCustomMessage', { payload: { message: lorem } } ));
        }, 10000);
}

function sendMessage(message){
    console.log('sending: ', message.toString());
    ws.send(message.toJSON());
}

function applicationMessageHandler(message){
    var payload = message.getDataProp('payload');
    if (payload.hasOwnProperty('message')){
        console.log( payload.sender, payload.chat );
    }
    if (payload.hasOwnProperty('introduction')){
    }

}

function roomMessageHandler( message ){
    console.log( message.toString() );
}

function TestClient(){
    this.state = 0;
}
