var tessel = require("tessel");

var mqtt = require("mqtt");

var client = mqtt.createClient(1883, "192.168.2.11");

var servolib = require("servo-pca9685");
var servo = servolib.use(tessel.port["A"]);

var maxTemp = 40;
var minTemp = 0;


client.subscribe("inTopic");

var led1 = tessel.led[0].output(0);
var led2 = tessel.led[1].output(0);


client.on("message", function(topic, message) {
	console.log("incoming event: "+message);
	led1.toggle();
	led2.toggle();

    var position = (message/(maxTemp-minTemp));

	servo.move(1, position);
	position += 0.1;
	if (position > 1) {
		position = 0;
	}
});