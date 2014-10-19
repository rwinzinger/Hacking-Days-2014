package com.senacor.hackingdays.dropwizard.helloworld;

import com.senacor.hackingdays.dropwizard.helloworld.resources.MessageResource;
import org.codehaus.jackson.map.Module;

import com.yammer.dropwizard.Service;
import com.yammer.dropwizard.config.Environment;
import com.yammer.dropwizard.json.Json;

public class MQTTService extends Service<MQTTServiceConfiguration> {

    public static void main(String[] args) throws Exception {
        new MQTTService().run(args);
    }

	private MQTTService() {
		super("helloworld");
	}

	@Override
	protected void initialize(MQTTServiceConfiguration configuration,
			Environment environment) throws Exception {

		environment.addResource(MessageResource.class);

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
