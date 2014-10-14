var mqtt = require('mqtt')

client = mqtt.createClient(1883, 'wir-amba.fritz.box');

client.subscribe('light');

client.on('message', function (topic, message) {
  console.log(topic+": "+message);
  // client.end();
});

client.on('connect', function () {
  console.log("connect");
  // client.publish('temperature', 'Hello mqtt');
});




