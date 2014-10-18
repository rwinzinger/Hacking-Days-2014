// include the library code:
#include <SPI.h>        
#include <Ethernet.h>
#include <EthernetUdp.h>
#include <Time.h>

//#define DIFF(a,b) (((a)<(b))?(b)-(a):(a)-(b))
//#define MAX(a,b) (((a)<(b))?(b):(a))
//#define MIN(a,b) (((a)<(b))?(a):(b))
//#define T(a,b) ((a)*60+(b))

/** BLOCK FOR NTP **/
// Enter a MAC address for your controller below.
// Newer Ethernet shields have a MAC address printed on a sticker on the shield
byte mac[] = {  
  0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };

unsigned int localPort = 8888;      // local port to listen for UDP packets

IPAddress timeServer(132, 163, 4, 101); // time-a.timefreq.bldrdoc.gov NTP server
//IPAddress timeServer(132, 163, 4, 101); // time-a.timefreq.bldrdoc.gov NTP server
// IPAddress timeServer(132, 163, 4, 102); // time-b.timefreq.bldrdoc.gov NTP server
// IPAddress timeServer(132, 163, 4, 103); // time-c.timefreq.bldrdoc.gov NTP server

const int NTP_PACKET_SIZE= 48; // NTP time stamp is in the first 48 bytes of the message

byte packetBuffer[ NTP_PACKET_SIZE]; //buffer to hold incoming and outgoing packets

// A UDP instance to let us send and receive packets over UDP
EthernetUDP Udp;

const unsigned long seventyYears = 2208988800UL;     

void setup() {
   // Open serial communications and  port to open:
  Serial.begin(9600);
   while (!Serial) {
    ; // wait for serial port to connect. Needed for Leonardo only
  }

  // Wait for network shield to boot
  Serial.println("Wait for booting");
  delay(2000);
  
  initEth();

  Serial.println("Get NTP Time");
  setTimeFromNTP();
  
  log("Startup complete");
}

void setTimeFromNTP() {
  sendNTPpacket(timeServer); // send an NTP packet to a time server
    // wait to see if a reply is available
  delay(1000);  
  if ( Udp.parsePacket() ) {  
    // We've received a packet, read the data from it
    Udp.read(packetBuffer,NTP_PACKET_SIZE);  // read the packet into the buffer

    //the timestamp starts at byte 40 of the received packet and is four bytes,
    // or two words, long. First, esxtract the two words:

    unsigned long highWord = word(packetBuffer[40], packetBuffer[41]);
    unsigned long lowWord = word(packetBuffer[42], packetBuffer[43]);  
    // combine the four bytes (two words) into a long integer
    // this is NTP time (seconds since Jan 1 1900):
    unsigned long secsSince1900_ntp = highWord << 16 | lowWord;
//    secsSince1900_corresponding_millis = millis();
    
//    secsSince1900_ntp -= (3600L * 24 * 3) + 3600L * 14;
    
    if (istSommerzeit(secsSince1900_ntp - seventyYears + 3600))
      setTime(secsSince1900_ntp - seventyYears + 7200);
    else
      setTime(secsSince1900_ntp - seventyYears + 3600);
  
  }
}  

// Letzer Sonntag im März ab 2 Uhr bis
// Letzer Sonntag im Oktober um 3 Uhr
bool istSommerzeit(time_t t) {
  int m = month(t);
  switch (m) {
    case 1: case 2: case 11: case 12:
      return false;
    case 4: case 5: case 6: case 7: case 8: case 9:
      return true;
    case 3: case 10: 
    {
      int d = day(t);
      Serial.print("Day:");
      Serial.println(d);
      if (d <= 24)  // All Tage bis zum 24 sind vor dem letzen Sonntag im Monat
        return m == 10; 
        
      int wd = weekday(t);
      Serial.print("Weekday:");
      Serial.println(wd);
     
      if (wd < d - 24) { // letzter Sonntag oder später
        if (wd == 1)  // letzer Sonntag
          return (hour(t) >= 2) ^ (m == 10);
        return m == 3;
      }
      // Rest liegt vor dem letzen Sonntag
      return m == 10;
    }
      
  }
}

void log(String msg) {
  Serial.print("[");
  printTimestampSerial();
  Serial.print("] ");
  Serial.println(msg);
}

void log(String msg1, String msg2) {
  Serial.print("[");
  printTimestampSerial();
  Serial.print("] ");
  Serial.print(msg1);
  Serial.println(msg2);
}

void printTimestampSerial() {
  Serial.print(year()%100);
  Serial.print("/");

  int t = month();
  if (t < 0)
    Serial.print("0");
  Serial.print(t);  
  Serial.print("/");

  t = day();
  if (t < 0)
    Serial.print("0");
  Serial.print(t);  
  Serial.print("/");

  t = hour();
  if (t < 0)
    Serial.print("0");
  Serial.print(t);  
  Serial.print(":");

  t = minute();
  if (t < 0)
    Serial.print("0");
  Serial.print(t);  
  Serial.print(":");

  t = second();
  if (t < 0)
    Serial.print("0");
  Serial.print(t);  
}



void loop() {

  delay(2000);
  log("Show time");
}

void initEth() {

  Serial.println("Try init eth");

  // start Ethernet and UDP
  if (Ethernet.begin(mac) == 0) {
    Serial.println("Failed to configure Ethernet using DHCP");
    // no point in carrying on, so do nothing forevermore:
    for(;;)
      ;
  }

  log("Ethernet link ok");

  Udp.begin(localPort);

}


// send an NTP request to the time server at the given address
unsigned long sendNTPpacket(IPAddress& address)
{
  // set all bytes in the buffer to 0
  memset(packetBuffer, 0, NTP_PACKET_SIZE);
  // Initialize values needed to form NTP request
  // (see URL above for details on the packets)
  packetBuffer[0] = 0b11100011;   // LI, Version, Mode
  packetBuffer[1] = 0;     // Stratum, or type of clock
  packetBuffer[2] = 6;     // Polling Interval
  packetBuffer[3] = 0xEC;  // Peer Clock Precision
  // 8 bytes of zero for Root Delay & Root Dispersion
  packetBuffer[12]  = 49;
  packetBuffer[13]  = 0x4E;
  packetBuffer[14]  = 49;
  packetBuffer[15]  = 52;

  // all NTP fields have been given values, now
  // you can send a packet requesting a timestamp:         
  Udp.beginPacket("ptbtime1.ptb.de", 123); //NTP requests are to port 123
  Udp.write(packetBuffer,NTP_PACKET_SIZE);
  Udp.endPacket();
}

