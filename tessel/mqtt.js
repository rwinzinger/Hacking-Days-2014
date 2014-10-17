var mqtt = require('mqtt')
var tessel = require("tessel");

var led1 = tessel.led[0].output(0);
var led2 = tessel.led[1].output(0);

client = mqtt.createClient(19709, 'm20.cloudmqtt.com', {username:"evnevuat", password:"G4yO7QTrmogs", clientId:"18773"});

client.subscribe('t_temp');

var servolib = require("servo-pca9685");
var servo = servolib.use(tessel.port["A"]);

var maxTemp = 40;
var minTemp = 0;

var position = 0;

client.on('message', function (topic, message) {
  console.log(topic+": "+message);
  led1.toggle();
  led2.toggle();

	position += 0.1;
	if (position > 1) {
		position = 0;
	}
	servo.move(1, position);
});

client.on('connect', function () {
  console.log("connect");
  // client.publish('temperature', 'Hello mqtt');
});

process.on("exit", function() {
	console.log("about to exit ...")
	client.end();
})
