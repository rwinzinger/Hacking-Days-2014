// include the library code:
#include <SPI.h>        
#include <Ethernet.h>

// initialize the library with the numbers of the interface pins


// Mein China LCD hat die Belegung 8, 9, 4, 5, 6, 7
// Um kompatibel mit der Netbridge zu bleiben habe ich die
// Verkabelung auf 8, 9, 3, 5, 6, 7 umgebogen.



void setup() {
     // Open serial communications and wait for port to open:
  Serial.begin(9600);
   while (!Serial) {
    ; // wait for serial port to connect. Needed for Leonardo only
  }

  // Wait for network shield to boot
  printStatus("Wait for booting");
  delay(2000);
  
  // put your setup code here, to run once:
  for (int i = 22; i < 52; i++)  
    pinMode(i, OUTPUT);
    
   pinMode(A8, INPUT);


}



unsigned long previousMillis = 0;        // will store last time LED was updated

long interval = 50;           // interval at which to blink (milliseconds)

void loop() {

    unsigned long currentMillis = millis();
 
  if(currentMillis - previousMillis >= interval) {
    // save the last time you blinked the LED 
    previousMillis = currentMillis;   

    // set the LED with the ledState of the variable:
    changeState();
  }

}




const int led_start = 22; // inclusive
const int led_end = 52; // exclusive

int looping = led_start;

int led_moving_start = led_start;

void changeState(){
//  Serial.print("change State. Looping ");
//  Serial.print(looping);
//  Serial.println();
  
    if (digitalRead(A8) == LOW)
      return;
  
  
  
  for (int i = led_start; i < led_moving_start; i++)  
    digitalWrite(i, LOW);

  // put your main code here, to run repeatedly:
  for (int i = led_moving_start; i < led_end; i++)  
    digitalWrite(i, HIGH);

  digitalWrite(looping, LOW);
  
  looping++; 
  if (looping == led_end) {
//    if (digitalRead(A8) == HIGH)
//      Serial.println("ON");
//    else
//      Serial.println("OFF");



    looping = led_moving_start;
    interval -= 10;
    if (interval == 0) {
      interval = 50;
      led_moving_start++;
      if (led_moving_start == led_end - 1)
        led_moving_start = led_start;
    }
  }

}




void printStatus(char* msg) {
  Serial.println(msg);
}
