var stdio = require('stdio');
var mqtt = require('mqtt');
var url = require('url');

var args = stdio.getopt({
    'topic': {key: 't', args: 1, description: 'topic name', mandatory: true},
	'restport': {key: 'r', args: 1, description: 'rest server port', mandatory: true},
	'mqttserver': {key: 's', args: 1, description: 'mqtt server ip'},
	'mqttport': {key: 'p', args: 1, description: 'mqtt server port'},
	'mqttauth': {key: 'u', args: 2, description: 'mqtt authentication parameters'}
});



var MY_PORT = args.restport; // default: 4730
var baseUrl = '/sensor/';

var topic = args.topic;
var mqttServerIp = args.mqttserver || '192.168.2.11'
var mqttServerPort = args.mqttport || '1883';
var mqttServerUser = args.mqttauth ? args.mqttauth[0] : null;
var mqttServerPassword = args.mqttauth ? args.mqttauth[1] : null;
var endpoint = topic.split("_")[1];

console.log("using topic: " + topic);
console.log("using mqtt: " + mqttServerIp + ":" + mqttServerPort);
console.log("serving at: " + MY_PORT+baseUrl+endpoint)

var mqttClient = mqtt.createClient(mqttServerPort, mqttServerIp, {
    username: mqttServerUser,
    password: mqttServerPassword 
});


var lastMessage = null;


mqttClient.on('connect', function() { // When connected
  mqttClient.subscribe(topic, function() {
    mqttClient.on('message', function(topic, message, packet) {
      	console.log("Received '" + message + "' on '" + topic + "'");
		lastMessage = JSON.parse(message);
    });
  });
});

var express = require('express');
var app = express();

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-XSRF-TOKEN');
  next();
};

app.use(allowCrossDomain);

app.get(baseUrl + endpoint, function(req, res) {
	//res.json({value:0.123123,unit:'L'});
	if (lastMessage) {
		res.json(lastMessage);
		lastMessage = null;
	} else {
		res.status(204).send('No Content');
	}
});

app.listen(MY_PORT);