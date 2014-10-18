#include <string.h>
#include <stdlib.h>
#include <SPI.h>
#include <Ethernet.h>
#include <PubSubClient.h>
#include <LiquidCrystal.h>
#include <JsonParser.h>

using namespace ArduinoJson::Parser;

// JSON Parser can be retrieved at: https://github.com/not404/json-arduino
// PubSubClient can be retrieved at: https://github.com/knolleary/pubsubclient/tags

LiquidCrystal lcd(8, 9, 3, 5, 6, 7);

// Update these with values suitable for your network.
byte mac[]  = {  
  0xDE, 0xED, 0xBA, 0xFE, 0xFE, 0xED };
  
byte full[8] = {
  B11111,
  B11111,
  B11111,
  B11111,
  B11111,
  B11111,
  B11111,
  B11111
};
  
EthernetClient ethernetClient;
PubSubClient client("m20.cloudmqtt.com", 19709, callback, ethernetClient);

JsonParser<32> parser;

void callback(char* topic, byte* payload, unsigned int length) {
  //Serial.write(payload,length);
  lcd.clear();
  
  char msg[length+1];
  memcpy(msg, payload, length);
  msg[length] = 0;
  
  JsonObject root = parser.parse(msg);
  
  double value = root["value"];
  char* unit = root["unit"];
  
  lcd.print(value,4);
  lcd.print(" (");
  lcd.print(unit);
  lcd.print(") LIGHT");
  
  int amount = value * 150;
  int maxi = min(amount,16);
  
  lcd.setCursor(0,1);
  
  for (int i = 0; i < maxi; i++) {
    delay(50);
    lcd.write(byte(0));
  }
 }

void setup()
{
  Serial.begin(9600);
  
  lcd.createChar(0, full);
  lcd.begin(16,2);
  
  Ethernet.begin(mac);
  Serial.print("IP address: ");
  Serial.println(Ethernet.localIP());

  if (client.connect("client", "evnevuat", "G4yO7QTrmogs")) {
    Serial.println("Connected to mqtt: " +  client.connected());
    client.subscribe("t_light");
  }
}

void loop()
{
  client.loop();
}


