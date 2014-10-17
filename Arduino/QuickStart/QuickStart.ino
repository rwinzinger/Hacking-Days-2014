// include the library code:
#include <LiquidCrystal.h>
#include <SPI.h>        
#include <Ethernet.h>

// initialize the library with the numbers of the interface pins
LiquidCrystal lcd(8, 9, 3, 5, 6, 7);


void setup() {
     // Open serial communications and wait for port to open:
  Serial.begin(9600);
   while (!Serial) {
    ; // wait for serial port to connect. Needed for Leonardo only
  }

  // set up the LCD's number of columns and rows:
  lcd.begin(16, 2);

  // Wait for network shield to boot
  printStatus("Wait for booting");
  delay(2000);
  
  // put your setup code here, to run once:

}

void loop() {
  printStatus("Ready");
  // put your main code here, to run repeatedly:

}

void printStatus(char* msg) {
  lcd.clear();
  lcd.setCursor(0, 1);
  lcd.print(msg);
}
