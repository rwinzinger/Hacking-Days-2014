var mqtt = require('mqtt');
/**
 * Create client for mqtt connection.
 */
client = mqtt.createClient(19709, 'm20.cloudmqtt.com', {
	username : "evnevuat",
	password : "G4yO7QTrmogs",
	clientId : "18722"
});

// Subscribe to channels
client.subscribe('t_temp');
client.subscribe('t_sound');
client.subscribe('t_light');
client.subscribe('t_tilt');

// Initialize tessel modules
var tessel = require("tessel")
,led1 = tessel.led[0].output(0)
,led2 = tessel.led[1].output(0)
,servolib = require("servo-pca9685")
,servo = servolib.use(tessel.port["A"]);

// Initialize value ranges.
var maxTemp = 50
,minTemp = 0
,minLight = 0.01
,maxLight = 0.16
,minTilt = -1
,maxTilt = 1;


/**
 * Defines behavior if a message comes in on one of the channels.
 */
client.on('message', function(topic, message) {
	console.log(topic + ": " + message);
	
	// Topic t_tilt
	if(String(topic)==="t_tilt"){
		led2.toggle();
		try{
			var positionTilt = computePositionInInterval(message, minTilt, maxTilt);
			positionTilt = keepPositionInRange(positionTilt);
			console.log("Position tilt: " + positionTilt);
			// revert position because of direction of servo
			servo.move(16,1-(positionTilt));
		} catch(err){
			console.log("Error processing t_tilt data. " + err);
		}
	}
	
	// Topic t_light
//	if(String(topic)==="t_light"){
//		led2.toggle();
//		try{
//			var jsonMessage = JSON.parse(message);
//			var positionLight = computePositionInInterval(jsonMessage.value, minLight, maxLight);
//			positionLight = keepPositionInRange(positionLight);
//			console.log("Position light: " + positionLight);
//			// revert position because of direction of servo
//			servo.move(16,1-(positionLight));
//		} catch(err){
//			console.log("Error processing t_light data. " + err);
//		}
//	}
	
	// Topic t_sound
	if (String(topic) === "t_sound") {
		// No functionality right now.
	}
	
	// Topic t_temp
	if (String(topic) === "t_temp") {
		led1.toggle();
		try{
			var jsonMessage = JSON.parse(message);
			var positionTemp = computePositionInInterval(jsonMessage.value, minTemp, maxTemp);
			positionTemp = keepPositionInRange(positionTemp);
			console.log("Position temp: " + positionTemp);
			servo.move(1, positionTemp);
		}
		catch(err){
			console.log("Error processing t_temp data. " + err);
		}
	}
});

/**
 * Log if connection to mqtt has been successful.
 */
client.on('connect', function() {
	console.log("connect");
});

/**
 * End client if system exits
 */
process.on("exit", function() {
	console.log("about to exit ...");
	client.end();
});

/**
 * Initalize servos on first successful contact.
 */
servo.on('ready', function () {

  //  Set the minimum and maximum duty cycle for servo 1.
  //  If the servo doesn't move to its full extent or stalls out
  //  and gets hot, try tuning these values (0.05 and 0.12).
  //  Moving them towards each other = less movement range
  //  Moving them apart = more range, more likely to stall and burn out
  servo.configure(1, 0.05, 0.12, function () {
	  servo.move(1,0);
  });
  servo.configure(16, 0.05, 0.12, function(){
	  servo.move(16,0);
  });
  led1.toggle();
  led2.toggle();
});

/**
 * Cuts values above 1 and below 0.
 * @param position 
 * @returns The original position or 0/1 if the value is out of bounds.
 */
function keepPositionInRange(position){
	// Use 0.98 because there have been problems using 1...
	if (position > 0.98) {
		position = 0.98;
	}
	if (position < 0) {
		position = 0;
	}
	return position;
}

/**
 * Computes the relative position of the given value inside the range of min and max position.
 * @param absoluteValue
 * @param minValue
 * @param maxValue
 * @returns {Number}
 */
function computePositionInInterval(absoluteValue, minValue, maxValue){
	var range = maxValue - minValue;
	return (Number(absoluteValue)-minValue)/range;
}