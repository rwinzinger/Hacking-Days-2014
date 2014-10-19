package com.senacor.hackingdays.dropwizard.helloworld.resources;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;

import com.senacor.hackingdays.dropwizard.helloworld.api.MQTTMessage;
import com.google.common.base.Optional;
import com.yammer.metrics.annotation.Timed;
import org.fusesource.hawtbuf.Buffer;
import org.fusesource.mqtt.client.*;

import java.util.concurrent.TimeUnit;

@Path("/message")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class MessageResource {

    private static String defaultQueue = "t_light";
    private static String defaultTimeout = "5000";

    public MessageResource() {
    }

    @GET
    @Timed(name = "get-requests")
    public MQTTMessage get(@QueryParam("queue") Optional<String> queue, @QueryParam("timeout") Optional<String> timeout) {
        MQTTMessage result = new MQTTMessage();

        final String messageContent = getMessage(queue.or(defaultQueue), timeout.or(defaultTimeout));

        result.setMessage(messageContent);
        return result;
    }

    private String getMessage(final String queue, final String timeoutStr) {
        MQTT mqtt = new MQTT();
        try {
            final Long timeout = Long.parseLong(timeoutStr);
            System.out.print(timeout);
            mqtt.setHost("m20.cloudmqtt.com", 19709);
            mqtt.setUserName("evnevuat");
            mqtt.setPassword("G4yO7QTrmogs");


            final FutureConnection connection = mqtt.futureConnection();
            final Future<Void> connectionFuture = connection.connect();
            connectionFuture.await(timeout, TimeUnit.MILLISECONDS);

            Future<byte[]> topicFuture = connection.subscribe(new Topic[]{new Topic(queue, QoS.AT_LEAST_ONCE)});
            topicFuture.await(timeout, TimeUnit.MILLISECONDS);
            Future<Message> messageFuture = connection.receive();

            final Message message = messageFuture.await(timeout, TimeUnit.MILLISECONDS);
            message.ack();

            Future<Void> disconnectFuture = connection.disconnect();
            disconnectFuture.await(timeout, TimeUnit.MILLISECONDS);

            return new String(message.getPayload());
        }
        catch(Exception e){
            return e.getMessage();
        }
    }
}

