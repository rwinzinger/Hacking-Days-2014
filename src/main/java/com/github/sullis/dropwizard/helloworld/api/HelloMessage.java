package com.github.sullis.dropwizard.helloworld.api;

import org.fusesource.mqtt.client.*;

import java.net.URISyntaxException;
import java.util.Date;

public class HelloMessage {
	private String message = "Hello";
	private Date timestamp = new Date();

	public Date getTimestamp() {
		return timestamp;
	}
	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}

	public String getMessage() {
        MQTT mqtt = new MQTT();
        try {
            mqtt.setHost("m20.cloudmqtt.com",19709);
            mqtt.setUserName("evnevuat");
            mqtt.setPassword("G4yO7QTrmogs");
            BlockingConnection connection = mqtt.blockingConnection();
            connection.connect();
            Topic[] topics = {new Topic("t_light", QoS.AT_LEAST_ONCE)};
            byte[] qoses = connection.subscribe(topics);
            Message message = connection.receive();
            System.out.println(message.getTopic());
            byte[] payload = message.getPayload();
            this.message = new String(message.getPayload());
            message.ack();
        }  catch (Exception e) {
            message = e.toString();
        }
        return message;
	}

	public void setMessage(String msg) {
		message = msg;
	}

}
