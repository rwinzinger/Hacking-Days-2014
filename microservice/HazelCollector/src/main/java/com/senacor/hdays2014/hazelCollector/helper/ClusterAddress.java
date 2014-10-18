package com.senacor.hdays2014.hazelCollector.helper;

/**
 * Created with IntelliJ IDEA.
 * User: rscholz
 * Date: 17.10.14
 * Time: 23:33
 * To change this template use File | Settings | File Templates.
 */
public class ClusterAddress {
  private String[] addresses;

  public String[] getAddresses() {
    return addresses;
  }

  public void setAddresses(String[] addresses) {
    this.addresses = addresses;
  }

  public ClusterAddress(String[] addresses) {
    this.addresses = addresses;
  }
}
