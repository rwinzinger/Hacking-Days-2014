/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 * 
 URL mqtt://evnevuat:G4yO7QTrmogs@m20.cloudmqtt.com:19709
 Hostname m20.cloudmqtt.com
 Username evnevuat
 Password G4yO7QTrmogs
 Port 19709
 * 
 */


var mqtt = require('mqtt');
var eventCount = 0;

client = mqtt.createClient(19709, "m20.cloudmqtt.com",
        {username: "evnevuat",
            password: "G4yO7QTrmogs",
            clientId: "Freshco-07"});

register = function(topic) {
    client.subscribe(topic, function() {
    
        console.log(" SUBSCRIBE "+ topic +"CALLBACK ENTER " );

        client.on('message', function(_topic, message) {
            if (_topic === topic) {
               console.log(topic + " ** " + message);
               eventCount = eventCount + 1; // Threadsafe??
        }
        });
 
        console.log(" SUBSCRIBE CALLBACK EXIT");

    });
    
};

client.on("connect", function() {

    console.log("Connect erfolgreich");

         
    register("t_temp");
    register("t_hum");
    register("t_light");
    register("t_sound");
    

    console.log("Subscribe erfolgreich");


});


process.on("exit", function() {
        client.end();
        console.log("exited - processed " + eventCount + " events");
    }
);

console.log("finished Setup");
