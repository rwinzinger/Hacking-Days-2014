#include <LiquidCrystal.h>


#include <SPI.h>
#include <Ethernet.h>
#include <PubSubClient.h>

// the media access control (ethernet hardware) address for the shield:
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };  
//the IP address for the shield:
byte ip[] = { 192, 168, 40, 21 };    

byte server[] = { 192, 168, 40, 20  };

EthernetClient ethClient;
PubSubClient client(server, 1883, callback, ethClient);

LiquidCrystal lcd(8, 9, 3, 5, 6, 7);

void callback(char* topic, byte* payload, unsigned int length) {
  
  char* p = (char*)malloc(length + 1);
  // Copy the payload to the new buffer
  memcpy(p,payload,length);
  p[length] = 0;
  
  printStatus(p);
    
  // client.publish("outTopic", p);
  // Free the memory
  free(p);
  
}

  /*
  Serial.println("Got Callback");
  
  char* p = (char*)malloc(length + 1);
  // Copy the payload to the new buffer
  memcpy(p,payload,length);
  p[length] = 0;
  Serial.println(p);
  // handle message arrived
*/



void setup()
{
  
  lcd.begin(16, 2);

  // Wait for network shield to boot
  printStatus("Wait for booting");
  delay(2000);
  
  Ethernet.begin(mac, ip);
  
  Serial.begin(9600);
   while (!Serial) {
    ; // wait for serial port to connect. Needed for Leonardo only
  }
  
  if (client.connect("arduinoClient")) {
    client.publish("outTopic","Initialized");
    client.subscribe("inTopic");
  } else {
        Serial.println("No Client ...");
  }

  // give the Ethernet shield a second to initialize:
  delay(1000);
}

void loop () {
  client.loop();
}

void printStatus(char* msg) {
  lcd.clear();
  lcd.setCursor(0, 1);
  lcd.print(msg);
}
