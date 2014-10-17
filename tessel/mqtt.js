var mqtt = require('mqtt')
var tessel = require("tessel");

var led1 = tessel.led[0].output(0);
var led2 = tessel.led[1].output(0);

client = mqtt.createClient(19709, 'm20.cloudmqtt.com', {
	username : "evnevuat",
	password : "G4yO7QTrmogs",
	clientId : "18777"
});

client.subscribe('t_temp');
client.subscribe('t_sound');

var servolib = require("servo-pca9685");
var servo = servolib.use(tessel.port["A"]);

var maxTemp = 30;
var minTemp = 10;

var position = 0;
var position2 = 0;

client.on('message', function(topic, message) {
	console.log(topic + ": " + message);
	console.log("t_sound?" + String(topic)==="t_sound");
	// Topic t_sound
	if (String(topic) === "t_sound") {
		
		if(position2 == 0){
			position2 = 1;
		}
		else if(position2 == 1){
			position2 = 0;
		}
		servo.move(16,position2);
	}
	
	// Topic t_temp
	if (String(topic) === "t_temp") {
		led1.toggle();
		led2.toggle();

		var jsonMessage = JSON.parse(message);
		console.log("jsonMessage: " + jsonMessage);
		console.log("jsonMessage.value: " + jsonMessage.value);
		position = Number(jsonMessage.value) / (maxTemp - minTemp);

		if (position > 1) {
			position = 1;
		}
		if (position < 0) {
			position = 0;
		}
		console.log("Position: " + position);

		servo.move(1, position);
	}
});

client.on('connect', function() {
	console.log("connect");
	// client.publish('temperature', 'Hello mqtt');
});

process.on("exit", function() {
	console.log("about to exit ...")
	client.end();
})
