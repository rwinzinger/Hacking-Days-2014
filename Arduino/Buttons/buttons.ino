#include <LiquidCrystal.h>

LiquidCrystal lcd(8, 9, 3, 5, 6, 7);


// define some values used by the panel and buttons
int lcd_key     = 0;
int adc_key_in  = 0;
#define btnRIGHT  0
#define btnUP     1
#define btnDOWN   2
#define btnLEFT   3
#define btnSELECT 4
#define btnNONE   5

// read the buttons
int read_LCD_buttons()
{
  adc_key_in = analogRead(8);      // read the value from the sensor 

  Serial.println(adc_key_in);

  // my buttons when read are centered at these valies: 0, 97, 251, 403, 636
  // we add approx 50 to those values and check to see if we are close
  if (adc_key_in > 1000) return btnNONE; 
  // We make this the 1st option for speed reasons since it will be the most likely result
  if (adc_key_in < 50)   return btnRIGHT;  
  if (adc_key_in < 140)  return btnUP; 
  if (adc_key_in < 300)  return btnDOWN; 
  if (adc_key_in < 450)  return btnLEFT; 
  if (adc_key_in < 680)  return btnSELECT;  

  return btnNONE;  // when all others fail, return this...
}

void setup() {
  lcd.begin(16, 2);
  lcd.setCursor(0,0);
  lcd.print("Push the buttons"); 

  Serial.begin(9600);
}

void loop() {
  lcd.setCursor(9,1);            // move cursor to second line "1" and 9 spaces over
  lcd.print(millis()/1000);      // display seconds elapsed since power-up

  lcd.setCursor(0,1);  
  lcd_key = read_LCD_buttons();  // read the buttons

  switch (lcd_key)   {
  
  case btnRIGHT:
    {
      lcd.print("RIGHT ");
      break;
    }
  case btnLEFT:
    {
      lcd.print("LEFT   ");
      break;
    }
  case btnUP:
    {
      lcd.print("UP    ");
      break;
    }
  case btnDOWN:
    {
      lcd.print("DOWN  ");
      break;
    }
  case btnSELECT:
    {
      lcd.print("SELECT");
      break;
    }
  case btnNONE:
    {
      lcd.print("NONE  ");
      break;
    }
  }

}




