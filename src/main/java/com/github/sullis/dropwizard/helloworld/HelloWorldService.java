package com.github.sullis.dropwizard.helloworld;

import com.google.common.collect.ImmutableMultimap;
import com.yammer.dropwizard.tasks.Task;
import org.codehaus.jackson.map.Module;

import com.github.sullis.dropwizard.helloworld.resources.HelloWorldResource;
import com.yammer.dropwizard.Service;
import com.yammer.dropwizard.config.Environment;
import com.yammer.dropwizard.json.Json;
import org.fusesource.mqtt.client.*;

import java.io.PrintWriter;

public class HelloWorldService extends Service<HelloWorldServiceConfiguration> {

	private HelloWorldService() {
		super("helloworld");
	}

    public static void main(String[] args) throws Exception {
        new HelloWorldService().run(args);
    }

	@Override
	protected void initialize(HelloWorldServiceConfiguration configuration,
			Environment environment) throws Exception {

		environment.addResource(HelloWorldResource.class);
        environment.addTask(new Task("getFromQueue") {
            @Override
            public void execute(ImmutableMultimap<String, String> parameters, PrintWriter output) throws Exception {
                MQTT mqtt = new MQTT();
                try {
                    mqtt.setHost("m20.cloudmqtt.com", 19709);
                    mqtt.setUserName("evnevuat");
                    mqtt.setPassword("G4yO7QTrmogs");
                    final BlockingConnection connection = mqtt.blockingConnection();
                    connection.connect();
                    final String queue = (String) parameters.get("queue").toArray()[0];
                    final Topic[] topics = {new Topic(queue, QoS.AT_LEAST_ONCE)};
                    byte[] qoses = connection.subscribe(topics);
                    final Message message = connection.receive();
                    byte[] payload = message.getPayload();
                    output.print(new String(payload));
                    message.ack();
                } catch (Exception e) {
                    output.print(e);
                }
            }
        });

	}



	@Override
	public Json getJson() {
		final CustomJson json = new CustomJson();
        for (Module module : getJacksonModules()) {
            json.registerModule(module);
        }
        return json;
	}

}
