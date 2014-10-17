var mqtt = require('mqtt')

client = mqtt.createClient(19709, 'm20.cloudmqtt.com', {
	username : "evnevuat",
	password : "G4yO7QTrmogs",
	clientId : "18775"
});

client.subscribe('t_temp');
client.subscribe('t_sound');


var maxTemp = 40;
var minTemp = 0;

var position = 0;
var position2 = 0;

client.on('message', function(topic, message) {
	console.log(topic + ": " + message);
	console.log("t_sound ==="+topic+"? " + String(String(topic)==="t_sound"));
	// Topic t_sound
	if (String(topic)==="t_sound") {
		
		if(position2 == 0){
			position2 = 1;
		}
		else if(position2 == 1){
			position2 = 0;
		}
	}
	
	// Topic t_temp
	if (String(topic) === "t_temp") {
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
