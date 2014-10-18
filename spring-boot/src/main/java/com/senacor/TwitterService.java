package com.senacor;

import java.util.Calendar;

import javax.inject.Inject;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.social.config.annotation.EnableSocial;
import org.springframework.social.twitter.api.impl.TwitterTemplate;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@EnableAutoConfiguration
@EnableSocial
public class TwitterService {

    private static final Logger LOGGER = LoggerFactory.getLogger(TwitterService.class);

    @Inject
    private TwitterTemplate twitterTemplate;

    @Bean
    public TwitterTemplate twitterTemplate() {
        return new TwitterTemplate(
                "JyMNVwiRaI3aqe9uXKNVNYNGK",
                "edwxLrEAu5YEAUFIBHHeEPvnaieKuFRncJLEqnYtCzR0ojCLRP",
                "2836217525-q2T9yMDOwPJZQpv2p7127Q9y0ddRe4LRr6vUvfM",
                "xrr05KDu0xPrWlsAK3Is9R1KKUv9aQTxOuAOixgshj3J9");
    }

    @RequestMapping(value = "/", method = RequestMethod.GET)
    String get() {
        return "Hello World!";
    }

    @RequestMapping(value = "/", method = RequestMethod.POST, consumes = "application/json")
    ResponseEntity<String> post(@RequestBody Payload payload) {
        Calendar c = Calendar.getInstance();
        twitterTemplate.timelineOperations()
                .updateStatus(String.format("%s #hackingDays2014 is %.2f - %s at %tB %te, %tY %tl:%tM %tp%n",
                        payload.getType(),
                        payload.getValue(),
                        payload.getUnit(),
                        c, c, c, c, c, c));
        return new ResponseEntity<String>(HttpStatus.OK);
    }

    public static void main(String[] args) throws Exception {
        SpringApplication.run(TwitterService.class, args);
    }


    public static class Payload {

        private String type;
        private String unit;
        private Float value;

        public Payload() {
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public void setValue(Float value) {
            this.value = value;
        }

        public void setUnit(String unit) {
            this.unit = unit;
        }

        public String getUnit() {
            return unit;
        }

        public Float getValue() {
            return value;
        }

        @Override
        public String toString() {
            return "Payload{" +
                    "type='" + type + '\'' +
                    ", unit='" + unit + '\'' +
                    ", value=" + value +
                    '}';
        }
    }
}
