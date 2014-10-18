var mqtt = require('mqtt')
  , host = 'm20.cloudmqtt.com'
  , port = 19709
  , options = {username : 'evnevuat', password: 'G4yO7QTrmogs'}
  , client = mqtt.createClient(port, host, options, {keepalive: 10000})
  , tessel = require('tessel')
  , climate = require('climate-si7020').use(tessel.port['A'])
  , ambientlib = require('ambient-attx4')
  , ambient = ambientlib.use(tessel.port['B']);

	client.publish('inTopic', 'tessla is up and running!');
  
	climate.on('ready', function ready() {
    	console.log('Climate module ready...');
	    setInterval(function() {
			// temperature
	        climate.readTemperature('c', function(err, temp) {
	        	if (!err) {
	  				console.log("Publishing TEMP " + temp.toFixed(2) + " ...");
	        		client.publish('t_temp', temp.toFixed(2) + " C");
	        	}
	      	});
			// humidity
	        climate.readHumidity(function(err, humid) {
	        	if (!err) {
	  				console.log("Publishing HUMID " + humid.toFixed(1) + " ...");
	        		client.publish('t_hum', humid.toFixed(1) + " %");
	        	}
	      	});
	    }, 9000);
	});
	
	ambient.on('ready', function () {
	 	console.log('Ambient module ready...');
		setInterval( function () {
			ambient.getLightLevel( function(err, ldata) {
	      	  if (err) throw err;
		  	  console.log("Publishing LIGHT " + ldata.toFixed(4) + " ...");
		  	  client.publish('t_light', ldata.toFixed(4) + " L");
	      
			  ambient.getSoundLevel( function(err, sdata) {
	        	  if (err) throw err;
		  		  console.log("Publishing SOUND " + sdata.toFixed(4) + " ...");
		  		  client.publish('t_sound', sdata.toFixed(4) + " DB");
	      	  });
	    	})
		}, 1000);
	});