var tessel = require('tessel');

var climatelib = require('climate-si7020');
var ambientlib = require('ambient-attx4');

var mqtt = require('mqtt')


client = mqtt.createClient(1883, '192.168.178.123');
client.on('connect', function () {
  mqttLog("connected to mqtt-broker");

  var ambient = ambientlib.use(tessel.port['B']);
  var climate = climatelib.use(tessel.port['A']);

  var ambientActive = false;
  var climateActive = false;

  climate.on('ready', function () {
    mqttLog('connected to si7020 (client)');
    climateActive = true;
  });

  ambient.on('ready', function () {
    mqttLog('connected to attx4 (ambient)');
    ambientActive = true;
  });

  // Loop forever
  setImmediate(function loop () {
    if (climateActive) {
      climate.readTemperature('c', function (err, temp) {
        climate.readHumidity(function (err, humid) {
          console.log('Degrees:', temp.toFixed(1) + 'C', 'Humidity:', humid.toFixed(1) + '%RH');
          client.publish('temperature', temp.toFixed(1));
          client.publish('humidity', humid.toFixed(1));
        });
      });
    }
    if (ambientActive) {
      ambient.getLightLevel( function(err, ldata) {
        if (err) throw err;
        ambient.getSoundLevel( function(err, sdata) {
          if (err) throw err;
          console.log("Light level:", ldata.toFixed(2), " ", "Sound Level:", sdata.toFixed(2));
          client.publish('light', ldata.toFixed(2));
          client.publish('sound', sdata.toFixed(2));
        });
      });
    }
    setTimeout(loop, 300);
  });

  climate.on('error', function(err) {
    mqttLog('error connecting climate-module', err);
  });

  ambient.on('error', function(err) {
    mqttLog('error connecting ambient-module', err);
  });
});

var mqttLog = function(msg) {
  console.log(msg);
  client.publish('log', msg);
}


