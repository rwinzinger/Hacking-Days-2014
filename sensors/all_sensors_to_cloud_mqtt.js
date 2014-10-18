var mqtt = require('mqtt')
  , host = 'm20.cloudmqtt.com'
  , port = 19709
  , options = {username : 'evnevuat', password: 'G4yO7QTrmogs'}
  , client = mqtt.createClient(port, host, options, {keepalive: 10000})
  , tessel = require('tessel')
  , climate = require('climate-si7020').use(tessel.port['A'])
  , ambientlib = require('ambient-attx4')
  , ambient = ambientlib.use(tessel.port['B']);

  function getJson(value, unit) 
  {
	  return '{"value":'+value+',"unit":"'+unit+'"}';
  }
  
  function publishToMqtt(topic,value,unit)
  {
	  try {
		  console.log("Publishing to topic <%s> { value : %d, unit : %s } ", topic, value, unit);
	  	  client.publish(topic, getJson(value,unit));
	  } catch (err) {
	  	  console.log('---- CLIENT ERROR --- ');
	  }
  }

	client.publish('inTopic', 'tessla is up and running!');
  
	climate.on('ready', function ready() {
    	console.log('Climate module ready...');
	    setInterval(function() {
			// temperature
	        climate.readTemperature('c', function(err, temp) {
	        	if (!err) {
	        		publishToMqtt('t_temp', temp.toFixed(2), 'C');
	        	}
	      	});
			// humidity
	        climate.readHumidity(function(err, humid) {
	        	if (!err) {
	        		publishToMqtt('t_hum', humid.toFixed(1), '%');
	        	}
	      	});
	    }, 9000);
	});
	
	ambient.on('ready', function () {
	 	console.log('Ambient module ready...');
		setInterval( function () {
			ambient.getLightLevel( function(err, ldata) {
	      	  if (err) throw err;
		  	  publishToMqtt('t_light', ldata.toFixed(4), 'L');
	      
		      /*
			  ambient.getSoundLevel( function(err, sdata) {
	        	  if (err) throw err;
		  		  publishToMqtt('t_sound', sdata.toFixed(4), 'DB');
	      	  });
			  */
	    	})
		}, 3000);
		
		// KLATSCH KLATSCH
	    ambient.setSoundTrigger(0.03);
	    var triggered = false;
	    ambient.on('sound-trigger', function(data) {
	  		if (triggered)  {
	  	    	ambient.clearSoundTrigger();
	  			triggered = false;
				publishToMqtt('t_sound', 2, 'KLATSCH');
	  	    	setTimeout(function () { ambient.setSoundTrigger(0.03); }, 500);
	  		} else {
	  			triggered = true;
	  	    	setTimeout(function () { triggered = false; }, 500);
	  	    	ambient.clearSoundTrigger();
	  	    	setTimeout(function () { ambient.setSoundTrigger(0.03); }, 50);
	  		}
	    });
	});
	
	process.on('exit', function() { client.end(); });