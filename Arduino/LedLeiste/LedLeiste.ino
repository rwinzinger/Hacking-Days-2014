
void setup() {
     // Open serial communications and wait for port to open:
  Serial.begin(9600);
   while (!Serial) {
    ; // wait for serial port to connect. Needed for Leonardo only
  }

  // initialize all pins required for the leds
  for (int i = 22; i < 52; i++)  
    pinMode(i, OUTPUT);
    
   pinMode(A8, INPUT);
}

unsigned long previousMillis = 0; 

long interval = 50;

void loop() {

    unsigned long currentMillis = millis();
 
  if(currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;   
    changeState();
  }

}

const int led_start = 22; // inclusive
const int led_end = 52; // exclusive

int looping = led_start;

int led_moving_start = led_start;

void changeState(){
    if (digitalRead(A8) == LOW)
      return;
  
  for (int i = led_start; i < led_moving_start; i++)  
    digitalWrite(i, LOW);

  for (int i = led_moving_start; i < led_end; i++)  
    digitalWrite(i, HIGH);

  digitalWrite(looping, LOW);
  
  looping++; 
  if (looping == led_end) {

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
