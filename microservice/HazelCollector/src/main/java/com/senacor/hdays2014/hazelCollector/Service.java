package com.senacor.hdays2014.hazelCollector;

import com.hazelcast.core.IMap;
import com.hazelcast.query.SqlPredicate;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;

/**
 * Created with IntelliJ IDEA.
 * User: rscholz
 * Date: 18.10.14
 * Time: 12:15
 * To change this template use File | Settings | File Templates.
 */
@RestController
@EnableAutoConfiguration
public class Service {
  @Autowired
  HazelCollector collector;
  @RequestMapping("/list")
  String getList(@RequestParam(value="topic") String topic, @RequestParam(value="index", required = false, defaultValue = "-1") int index) {

    Map<Integer, Event> map = collector.getMap(topic);

    if (index == -1) {
      index = collector.getIndex(topic);
    }

    Event e = map.get(index);

    if (e == null) {
      return new String("{}");
    }

    return e.toJSONString();
  }

  @RequestMapping("/find")
  String search(@RequestParam(value="topic") String topic, @RequestParam(value="criteria") String query) {
    StringBuffer result = new StringBuffer();
    result.append("[");
    IMap<Integer, Event> map = collector.getMap(topic);
    try {
      Set<Event> entries = (Set<Event>) map.values(new SqlPredicate(query));

      boolean first = true;
      for(Event e: entries) {
        if (!first) {
          result.append(",\n");
        }

        result.append(e.toJSONString());

        first = false;
      }
      result.append("]");
      return result.toString();
    } catch (Exception e) {
      e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
      return e.getMessage();
    }
  }
}
