// https://github.com/argon/node-apn/wiki/Preparing-Certificates
// var token = "<2c1399e6c6a2352ab6d60810e59d4c819ab0f364ca3cae3c5d598c84f6cc5d36>"
var apn = require('apn');
var restify = require('restify');
var mqtt = require('mqtt')
  , host = 'm20.cloudmqtt.com'
  , port = 19709
  , options = {username : 'evnevuat', password: 'G4yO7QTrmogs', client:'apnalert'}
  , client = mqtt.createClient(port, host, options);



var token = "<acf9e58af4572deccaade4a8d02c9e3e6d310002d6638bce3566badd78cb8d11>"
var options = { };
var apnConnection = new apn.Connection(options);
var myDevice = new apn.Device(token);

var server = restify.createServer(options);
server.use(restify.bodyParser({rejectUnknown:true}));



apnConnection.on('connected', function() {
    console.log("Connected");
});

apnConnection.on('transmitted', function(notification, device) {
    console.log("Notification transmitted to:" + device.token.toString('hex'));
});

apnConnection.on('transmissionError', function(errCode, notification, device) {
    console.error("Notification caused error: " + errCode + " for device ", device, notification);
    if (errCode == 8) {
        console.log("A error code of 8 indicates that the device token is invalid. This could be for a number of reasons - are you using the correct environment? i.e. Production vs. Sandbox");
    }
});


server.post('/boughtBeer', function (req, res, next) {
  console.log("data: "+req.body);
  var data = JSON.parse(req.body);

  var bought = data["bought"];
  console.log("bought: "+bought);

  client.publish('t_lcd', '{"type":"alert", "line1":"Bier gekauft", "line2":"-> '+bought+' Dosen"}', function(err) {
    if (err) {
  	  console.log("err: "+err);
    } else {
  	  console.log("msg sent");
    }
  });


  res.send(201, "created");
  return next();
})

server.post('/push', function (req, res, next) {
  console.log("data: "+req.body);
  var data = JSON.parse(req.body);

  var body = data["body"];
  var key = data["action-loc-key"];

  console.log("body: "+body);
  console.log("action-loc-key: "+key);

  var note = new apn.Notification();

  note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
  note.badge = 1;
  note.sound = "ping.aiff";
  note.alert = {"body":body, "action-loc-key":key}
  note.payload = {'foo': 'bar'};
  apnConnection.pushNotification(note, myDevice);

  client.publish('t_lcd', '{"type":"alert", "line1":"Alarm !!!", "line2":"'+body+'"}', function(err) {
    if (err) {
  	  console.log("err: "+err);
    } else {
  	  console.log("msg sent");
    }
  });

  res.send(201, "created");
  return next();
});



server.listen(8888, function () {
  console.log('(apn gateway) %s listening at %s', server.name, server.url);
});

process.on("exit", function() {
  apnConnection.shutdown();
})
