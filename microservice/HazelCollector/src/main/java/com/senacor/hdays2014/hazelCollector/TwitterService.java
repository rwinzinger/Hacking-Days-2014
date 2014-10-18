package com.senacor.hdays2014.hazelCollector;

import com.hazelcast.core.EntryEvent;
import com.hazelcast.core.EntryListener;
import com.hazelcast.core.IMap;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import twitter4j.Twitter;
import twitter4j.TwitterException;
import twitter4j.TwitterFactory;
import twitter4j.conf.ConfigurationBuilder;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Map;

/**
 * Created by mblume on 18.10.14.
 */
public class TwitterService {
    private static Log log = LogFactory.getLog(TwitterService.class);

    private LocalDateTime lastTweetTime = LocalDateTime.MIN;

    @Autowired
    HazelCollector hazelCollector;

    public void init(){
        final ConfigurationBuilder cb = new ConfigurationBuilder();
        cb.setOAuthConsumerKey("JyMNVwiRaI3aqe9uXKNVNYNGK")
                .setOAuthConsumerSecret("edwxLrEAu5YEAUFIBHHeEPvnaieKuFRncJLEqnYtCzR0ojCLRP")
                .setOAuthAccessToken("2836217525-q2T9yMDOwPJZQpv2p7127Q9y0ddRe4LRr6vUvfM")
                .setOAuthAccessTokenSecret("xrr05KDu0xPrWlsAK3Is9R1KKUv9aQTxOuAOixgshj3J9")
                .setDebugEnabled(true);
        final Twitter twitter = new TwitterFactory(cb.build()).getInstance();
        final IMap<Integer, Event> map = hazelCollector.getMap("t_temp");
        map.addEntryListener(new EntryListener<Integer, Event>() {
            @Override
            public void entryAdded(EntryEvent<Integer, Event> integerEventEntryEvent) {
                try {
                    final LocalDateTime now = LocalDateTime.now();
                    if(now.minusMinutes(5L).isAfter(lastTweetTime)) {
                        twitter.updateStatus("Temperature at " + LocalTime.now() + " #hackingDays2014 is " + integerEventEntryEvent.getValue().getValue() + " " + integerEventEntryEvent.getValue().getUnit());
                        lastTweetTime = now;
                        log.info("Tweetet temperature "+now);
                    }
                    else{
                        log.info(now+" Did not tweet because last tweet just happened.");
                    }
                } catch (TwitterException e) {
                    log.error(e.toString());
                }
            }

            @Override
            public void entryRemoved(EntryEvent<Integer, Event> integerEventEntryEvent) {
                // do nothing
            }

            @Override
            public void entryUpdated(EntryEvent<Integer, Event> integerEventEntryEvent) {
                // Do nothing
            }

            @Override
            public void entryEvicted(EntryEvent<Integer, Event> integerEventEntryEvent) {
                // Do nothing
            }
        }, true);
        log.info("Twitter service initialized");
    }
}
