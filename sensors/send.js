var mqtt = require('mqtt')
  , host = 'm20.cloudmqtt.com'
  , port = 19709
  , options = {username : 'evnevuat', password: 'G4yO7QTrmogs', client:'0815'}
  , client = mqtt.createClient(port, host, options);



client.publish('t_lcd', '{"type":"alert", "line1":"Alarm !!!", "line2":"Bier ist weg!"}', function(err) {
  if (err) {
  	console.log("err: "+err);
  } else {
  	console.log("msg sent");
  }
});


/*
client.publish('t_lcd', '{"type":"info", "line1":"Hallo, ", "line2":"Welt!"}', function(err) {
  if (err) {
  	console.log("err: "+err);
  } else {
  	console.log("msg sent");
  }
});
*/

client.subscribe('t_tilt');
client.subscribe('t_light');

client.on("message", function(topic, msg) {
	if (topic === 't_tilt') {
	  client.publish('t_lcd', '{"type":"info", "line1":"current tilt", "line2":"'+msg+'"}')
	} else {
      console.log(topic+" -> "+msg)
	}
})

process.on("exit", function() {client.end()});
