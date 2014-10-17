package com.github.sullis.dropwizard.helloworld.resources;

import javax.ws.rs.*;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriBuilder;

import com.github.sullis.dropwizard.helloworld.api.HelloMessage;
import com.google.common.base.Optional;
import com.yammer.metrics.annotation.Timed;

@Path("/helloworld")
public class HelloWorldResource {

    String username = "default";

    public HelloWorldResource() {
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public HelloMessage get() {
        HelloMessage hello = new HelloMessage();
        hello.setMessage("Hello " + username);
        return hello;
    }

    @POST
    @Consumes(MediaType.TEXT_PLAIN)
    public String add(String name) {
        username = name;
        return username;
    }
}

