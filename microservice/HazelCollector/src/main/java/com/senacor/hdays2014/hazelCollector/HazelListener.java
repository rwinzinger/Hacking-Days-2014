package com.senacor.hdays2014.hazelCollector;

import java.io.StringBufferInputStream;
import java.io.StringReader;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.Lock;

import com.hazelcast.config.Config;
import com.hazelcast.config.InterfacesConfig;
import com.hazelcast.config.TcpIpConfig;
import com.hazelcast.core.EntryEvent;
import com.hazelcast.core.EntryListener;
import com.hazelcast.core.Hazelcast;
import com.hazelcast.core.HazelcastInstance;
import com.senacor.hdays2014.hazelCollector.helper.ClusterAddress;
import jdk.nashorn.internal.parser.JSONParser;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.xml.transform.stream.StreamSource;

@Component
public class HazelListener{

    private Log log = LogFactory.getLog(HazelListener.class);
    private AtomicInteger counter = new AtomicInteger(0);
    private int lastMapEntry = 0;

    @Autowired
    ClusterAddress clusterAddress;

    private HazelcastInstance instance;
    private Map<String, Lock> lockMap = new HashMap<String, Lock>();


    public void init() {
        Config cfg = new Config();

        TcpIpConfig config = cfg.getNetworkConfig().getJoin().getTcpIpConfig();
        cfg.getNetworkConfig().getJoin().getMulticastConfig().setEnabled(false);
        cfg.getNetworkConfig().getInterfaces().addInterface("192.168.2.103:5701");
        config.setEnabled(true);

        for (String s: clusterAddress.getAddresses()) {
            config.addMember(s);
        }

        instance = Hazelcast.newHazelcastInstance(cfg);
        instance.getMap("t_temp").addEntryListener(new MyEntryListener("t_temp"), true);
        instance.getMap("t_light").addEntryListener(new MyEntryListener("t_light"), true);
        instance.getMap("t_hum").addEntryListener(new MyEntryListener("t_hum"), true);
        instance.getMap("t_sound").addEntryListener(new MyEntryListener("t_sound"), true);
        instance.getMap("lastKey").addEntryListener(new MyEntryListener(null), true);
    }

    public Event parseEvent(String data) {
        final JSONObject json = new JSONObject(data);

        Event event = new Event();
        event.setValue(String.valueOf(json.get("value")));
        event.setUnit(json.getString("unit"));
        event.setTimestamp(new Date());

        return event;
    }

    public void addEvent(String topic, String data) {
        if (instance == null) {
            init();
        }

        Event event = parseEvent(data);


        instance.getMap(topic).put(counter.incrementAndGet(),data);
    }

    public boolean getLock(String topic) {
        if (instance == null) {
            init();
        }

        Lock lock = instance.getLock(topic);
        try {
            if (lock.tryLock (5000, TimeUnit.MILLISECONDS)) {
                lockMap.put(topic, lock);
                return true;
            }
        } catch (InterruptedException e) {
            log.error("Could not get lock " + topic);
        }

        return false;
    }

    class MyEntryListener implements EntryListener<Object, Object>{
        private Log log = LogFactory.getLog(HazelCollector.class);
        final String queue;

        MyEntryListener(final String queue){
            this.queue = queue;
        }

        @Override
        public void entryAdded(EntryEvent<Object, Object> objectObjectEntryEvent) {
            log("Entry Added: ", objectObjectEntryEvent.getKey(), objectObjectEntryEvent.getValue());
        }

        @Override
        public void entryRemoved(EntryEvent<Object, Object> objectObjectEntryEvent) {
            log("Entry removed: ", objectObjectEntryEvent.getKey(), objectObjectEntryEvent.getValue());
        }

        @Override
        public void entryUpdated(EntryEvent<Object, Object> objectObjectEntryEvent) {
            log("Entry updated: ", objectObjectEntryEvent.getKey(), objectObjectEntryEvent.getValue());
        }

        @Override
        public void entryEvicted(EntryEvent<Object, Object> objectObjectEntryEvent) {
            log("Entry evicted: ", objectObjectEntryEvent.getKey(), objectObjectEntryEvent.getValue());
        }

        private void log(final String message, final Object key, final Object value){
            final String keyStr = key.toString();
            log.info( message + key +" "+value );
            if(queue!=null) {
                instance.getMap("lastKey").put(queue, counter.get());
            }
        }
    }

}
