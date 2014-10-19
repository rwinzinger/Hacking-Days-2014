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

boolean flashActive;
unsigned long flashStart;
char line1buffer[100];
char line2buffer[100];

boolean isShowing = false;

EthernetClient ethernetClient;
PubSubClient client("m20.cloudmqtt.com", 19709, callback, ethernetClient);

JsonParser<32> parser;

void callback(char* topic, byte* payload, unsigned int length) {
  //Serial.write(payload,length);
  lcd.clear();
  
  char msg[length+1];
  memcpy(msg, payload, length);
  msg[length] = 0;
  
  Serial.print("msg: ");
  Serial.println(msg);
  
  JsonObject root = parser.parse(msg);
  
  char *type  = root["type"];
  
  if (strcmp(type, "alert") == 0) {
    Serial.println("detected alert request");
    flashActive = true;
    flashStart = millis();
    strcpy(line1buffer, root["line1"]);
    strcpy(line2buffer, root["line2"]);
  } else {
    Serial.println("detected info request");
    flashActive = false;
    lcd.setCursor(0,0);
    lcd.print((char* )root["line1"]);
    lcd.setCursor(0,1);
    lcd.print((char *)root["line2"]);
  }

  
  
  
  
  /*
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
  */
 }

void setup()
{
  Serial.begin(9600);
  
  lcd.createChar(0, full);
  lcd.begin(16,2);
  
  Ethernet.begin(mac);
  Serial.print("IP address: ");
  Serial.println(Ethernet.localIP());
  
  lcd.setCursor(0,0);
  lcd.print("trying to");
  lcd.setCursor(0,1);
  lcd.print("connect to MQTT");
  
  if (client.connect("rw18775", "evnevuat", "G4yO7QTrmogs")) {
    Serial.println("Connected to mqtt: " +  client.connected());
    client.subscribe("t_lcd");
    lcd.clear();
    lcd.setCursor(0,0);
    lcd.print("Yay! Connected.");
    lcd.setCursor(0,1);
    lcd.print("-> t_lcd");
  } else {
    Serial.println("No Client ...");
    lcd.clear();
    lcd.setCursor(0,0);
    lcd.print("Sorry, tiger ...");
    lcd.setCursor(0,1);
    lcd.print("MQTT is gone!");
  }

}

void showMessage(void) {
  if (!isShowing) {
    Serial.println("now showing");
    lcd.setCursor(0,0);
    lcd.print(line1buffer);
    lcd.setCursor(0,1);
    lcd.print(line2buffer);
    isShowing = true;
  }
}

void clearMessage(void) {
  if (isShowing) {
    Serial.println("now clearing");
    lcd.clear();
    isShowing = false;
  }    
}

void loop()
{
  if (flashActive) {
    if (millis()-flashStart > 10000) {
      clearMessage();
    } else {
      if ((millis()-flashStart)/500 % 2 == 0) {
        showMessage();
      } else {
        clearMessage();
      }
    }
  }
  client.loop();
}


