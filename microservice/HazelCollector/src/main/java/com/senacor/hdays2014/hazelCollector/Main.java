package com.senacor.hdays2014.hazelCollector;

import com.senacor.hdays2014.hazelCollector.helper.ClusterAddress;
import com.senacor.hdays2014.hazelCollector.helper.MQTTConfig;
import com.senacor.hdays2014.hazelCollector.helper.TopicList;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableAutoConfiguration
@ComponentScan
public class Main {
  @Bean
  TopicList getTopicList() {
    TopicList topicList = new TopicList();
    topicList.getTopicList().add("t_temp");
    topicList.getTopicList().add("t_hum");
    topicList.getTopicList().add("t_light");
    topicList.getTopicList().add("t_sound");

    return topicList;
  }

  @Bean
  ClusterAddress getClusterAddress() {
    return new ClusterAddress(new String[]  {"192.168.50.1", "192.168.50.2"});
  }

  @Bean(initMethod = "init")
  HazelListener getHazelListener(){
      return new HazelListener();
  }

    @Bean(initMethod = "init")
    TwitterService getTwitterService(){
        return new TwitterService();
    }

  @Bean
  public MQTTConfig getMqttConfig() {
    return new MQTTConfig("m20.cloudmqtt.com", 19709, "evnevuat", "G4yO7QTrmogs");
  }

  @Bean(initMethod = "init") Server getServer() {
    return new Server();
  }

  public static void main(String[] args) throws Exception {
    SpringApplication.run(Main.class, args);
  }
}
