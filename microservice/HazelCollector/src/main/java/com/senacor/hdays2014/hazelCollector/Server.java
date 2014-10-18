package com.senacor.hdays2014.hazelCollector;

import com.senacor.hdays2014.hazelCollector.helper.TopicList;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

/**
 * Created with IntelliJ IDEA.
 * User: rscholz
 * Date: 17.10.14
 * Time: 23:44
 * To change this template use File | Settings | File Templates.
 */
public class Server {
  @Autowired
  private MQTTReceiver receiver;

  @Autowired
  TopicList topicList;

  public void init() {
    try {
      for(String t: topicList.getTopicList()) {
        receiver.subscribe(t);
      }
    } catch (MqttException e) {
      e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
    }
  }
}
