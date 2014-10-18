package com.senacor.hdays2014.hazelCollector;

import org.json.JSONString;

import java.io.Serializable;
import java.util.Date;

/**
 * Created with IntelliJ IDEA.
 * User: rscholz
 * Date: 18.10.14
 * Time: 10:01
 * To change this template use File | Settings | File Templates.
 */
public class Event implements Serializable, JSONString {
  private String topic;
  private String value;
  private String unit;

  public Date getTimestamp() {
    return timestamp;
  }

  public void setTimestamp(Date timestamp) {
    this.timestamp = timestamp;
  }

  private Date timestamp;

  public String getTopic() {
    return topic;
  }

  public void setTopic(String topic) {
    this.topic = topic;
  }

  public String getValue() {
    return value;
  }

  public void setValue(String value) {
    this.value = value;
  }

  public String getUnit() {
    return unit;
  }

  public void setUnit(String unit) {
    this.unit = unit;
  }

  @Override
  public String toJSONString() {
    return "{\"value\":" + value + ",\"unit\":\"" + unit + "\",\"timestamp\":\"" + timestamp.getTime() + "\"\\}";
  }

}
