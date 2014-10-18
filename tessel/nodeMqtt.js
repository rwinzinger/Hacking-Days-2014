/**
 * File to test the functionality of the mqtt-script without actually calling the tessel specific functionality.
 */
var mqtt = require('mqtt')

client = mqtt.createClient(19709, 'm20.cloudmqtt.com', {
	username : "evnevuat",
	password : "G4yO7QTrmogs",
	clientId : "18666"
});

client.subscribe('t_temp');
//client.subscribe('t_sound');
client.subscribe('t_light');
client.subscribe('t_tilt');

var maxTemp = 50;
var minTemp = 0;

var minLight = 0.01;
var maxLight = 0.13;



client.on('message', function(topic, message) {
	console.log(topic + ": " + message);
	
	// Topic t_light
	if(String(topic)==="t_light"){
		var jsonMessage = JSON.parse(message);
		
		var positionLight = computePositionInInterval(jsonMessage.value, minLight, maxLight);
		console.log("Position light: " + positionLight);
		
		if(positionLight < 0){
			positionLight = 0;
		}
		else if(positionLight >1){
			positionLight = 1;
		}
	}
	
	// Topic t_sound
	if (String(topic) === "t_sound") {
		
	}
	
	// Topic t_temp
	if (String(topic) === "t_temp") {

		var jsonMessage = JSON.parse(message);
		var positionTemp = computePositionInInterval(jsonMessage.value,minTemp,maxTemp);

		if (positionTemp > 1) {
			positionTemp = 1;
		}
		if (positionTemp < 0) {
			positionTemp = 0;
		}
		console.log("Position temp: " + positionTemp);
	}
});

function computePositionInInterval(absoluteValue, minValue, maxValue){
	var range = maxValue - minValue;
	return (Number(absoluteValue)-minValue)/range;
}


client.on('connect', function() {
	console.log("connect");
	// client.publish('temperature', 'Hello mqtt');
});

process.on("exit", function() {
	console.log("about to exit ...");
	client.end();
});