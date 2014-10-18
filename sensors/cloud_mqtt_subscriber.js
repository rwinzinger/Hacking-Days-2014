var mqtt = require('mqtt')
  // Make sure to change this to the IP address of your MQTT server
  , host = 'm20.cloudmqtt.com' // or localhost
  client = mqtt.createClient(19709, host, {username : 'evnevuat', password: 'G4yO7QTrmogs'}, {keepalive: 10000});
 
// Subscribe to the temperature topic
client.subscribe('inTopic');
client.subscribe('t_temp');
client.subscribe('t_hum');
client.subscribe('t_light');
client.subscribe('t_sound');
 
// When a temperature is published, it will show up here
client.on('message', function (topic, message) {
  console.log("Got a message!", topic, message);
});

process.on('exit', function() { client.end(); });