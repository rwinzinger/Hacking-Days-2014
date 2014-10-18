package com.senacor.hdays2014.hazelCollector.helper;

public class MQTTConfig {
  private String host;
  private int port;
  private String username;
  private String password;

  public MQTTConfig(String host, int port, String username, String password) {
    this.username = username;
    this.password = password;
    this.host = host;
    this.port = port;
  }

  public String getHost() {
    return host;
  }

  public String getUsername() {
    return username;
  }

  public String getPassword() {
    return password;
  }

  public int getPort() {

    return port;
  }
}
