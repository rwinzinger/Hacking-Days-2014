package com.senacor.hackingdays.dropwizard.helloworld.api;

import java.util.Date;

public class MQTTMessage {
	private String message = "empty";
	private Date timestamp = new Date();

	public Date getTimestamp() {
		return timestamp;
	}
	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String msg) {
		message = msg;
	}

}
