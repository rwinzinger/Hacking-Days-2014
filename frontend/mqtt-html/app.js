var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var mqtt = require('mqtt')

app.get('/', function(req, res){
  res.sendFile('index.html', {root:__dirname});
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});


io.on('connection', function(socket){
  console.log('a user connected');
  // var userKey = "umbpNNDEUvR1Li1grXYV8WCETb6Vtw";

});

client = mqtt.createClient(19709, 'm20.cloudmqtt.com', {username:"evnevuat", password:"G4yO7QTrmogs", clientId:"18773"});
client.subscribe('t_temp');
client.on('message', function (topic, message) {
	io.emit('temp', message);
});

