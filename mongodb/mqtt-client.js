var stdio = require('stdio');
var mqtt = require('mqtt');
var mongodb = require('mongodb')
var url = require('url');

var args = stdio.getopt({
    'topic': {key: 't', args: 1, description: 'topic name', mandatory: true},
	'mongourl': {key: 'm', args: 1, description: 'mongodb url'},
	'mqttserver': {key: 's', args: 1, description: 'mqtt server ip'},
	'mqttport': {key: 'p', args: 1, description: 'mqtt server port'},
	'mqttauth': {key: 'u', args: 2, description: 'mqtt authentication parameters'}
});

var topic = args.topic;
var dbUrl = args.mongourl || 'mongodb://127.0.0.1:27017/hacking'
var mqttServerIp = args.mqttserver || '192.168.2.11'
var mqttServerPort = args.mqttport || '1883';
var mqttServerUser = args.mqttauth ? args.mqttauth[0] : null;
var mqttServerPassword = args.mqttauth ? args.mqttauth[1] : null;
var collection = topic.split("_")[1];

console.log("using topic: " + topic);
console.log("using collection: " +  collection);
console.log("using mongodb: " + dbUrl);
console.log("using mqtt: " + mqttServerIp + ":" + mqttServerPort);

var mqttClient = mqtt.createClient(mqttServerPort, mqttServerIp, {
    username: mqttServerUser,
    password: mqttServerPassword 
});

var MongoClient = mongodb.MongoClient;

MongoClient.connect(dbUrl, function(err, db) {
  if(err) throw err;
  db.createCollection(collection, function(err, collection){});
});

mqttClient.on('connect', function() { // When connected
  mqttClient.subscribe(topic, function() {
    mqttClient.on('message', function(topic, message, packet) {
      	console.log("Received '" + message + "' on '" + topic + "'");
		MongoClient.connect(dbUrl, function(err, db) {
	  	  	if(err) throw err;
			var payload = JSON.parse(message);
			var doc = {timestamp: new Date(), type: collection, value: payload.value, unit: payload.unit};
			console.log("JSON doc: " +  JSON.stringify(doc));
	  		db.collection(collection, function(err, collection) {
				collection.insert(doc, {w: 1}, function(err, records){
				  console.log("Document added with id: "+records[0]._id);
				  db.close();
				});
	  		});
    	});
    });
  });
});
