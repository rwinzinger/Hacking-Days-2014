package com.senacor.hdays2014.hazelCollector;

import com.senacor.hdays2014.hazelCollector.helper.MQTTConfig;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.MqttCallback;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Created with IntelliJ IDEA.
 * User: rscholz
 * Date: 17.10.14
 * Time: 23:15
 * To change this template use File | Settings | File Templates.
 */
@Component
public class MQTTReceiver implements MqttCallback {

  private Log log = LogFactory.getLog(MQTTReceiver.class);

  private MqttClient client;
  private MqttConnectOptions connOpts;

  @Autowired
  MQTTConfig mqttConfig;

  @Autowired HazelCollector collector;

  private void init() throws MqttException {
    String url = "tcp://" + mqttConfig.getHost() + ":" + mqttConfig.getPort();

    MemoryPersistence persistence = new MemoryPersistence();
    client = new MqttClient(url, MqttClient.generateClientId(), persistence);
    connOpts = new MqttConnectOptions();
    connOpts.setUserName(mqttConfig.getUsername());
    connOpts.setPassword(mqttConfig.getPassword().toCharArray());

    client.connect(connOpts);

    client.setCallback(this);

  }

  public void subscribe(String topic) throws MqttException {
     if (collector.getLock(topic)) {
       if (client == null) {
         init();
       }
       client.subscribe(topic);
       log.info("Subscribed to " + topic);
    } else {
       log.error("Could not subscribe to " + topic);
     }
  }

  @Override
  public void connectionLost(Throwable throwable) {
  }

  @Override
  public void messageArrived(String s, MqttMessage mqttMessage) throws Exception {
    String data = new String(mqttMessage.getPayload());

    collector.addEvent(s, data);
  }

  @Override
  public void deliveryComplete(IMqttDeliveryToken iMqttDeliveryToken) {
  }
}
