export interface CodeSnippet {
  id: string;
  name: string;
  description: string;
  category: 'sensor' | 'display' | 'basic' | 'motor' | 'communication';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  components: string[];
  wiring: string[];
  code: string;
  deployed: boolean;
}

export const codeSnippets: CodeSnippet[] = [
  {
    id: 'basic-blink',
    name: 'Basic LED Blink',
    description: 'Blink the built-in LED on pin 13',
    category: 'basic',
    difficulty: 'beginner',
    components: ['Arduino Board'],
    wiring: ['Uses built-in LED on pin 13'],
    deployed: false,
    code: `// Basic LED Blink
// Blinks the built-in LED on pin 13

void setup() {
  Serial.begin(9600);
  pinMode(13, OUTPUT);
  Serial.println("STATUS:READY");
}

void loop() {
  digitalWrite(13, HIGH);
  Serial.println("LED:ON");
  delay(1000);

  digitalWrite(13, LOW);
  Serial.println("LED:OFF");
  delay(1000);
}
`
  },
  {
    id: 'hcsr04-ultrasonic',
    name: 'HC-SR04 Ultrasonic Sensor',
    description: 'Measure distance using HC-SR04 ultrasonic sensor',
    category: 'sensor',
    difficulty: 'beginner',
    components: ['HC-SR04 Ultrasonic Sensor'],
    wiring: [
      'VCC → 5V',
      'GND → GND',
      'Trig → Pin 9',
      'Echo → Pin 10'
    ],
    deployed: false,
    code: `// HC-SR04 Ultrasonic Distance Sensor
// Measures distance in centimeters

const int trigPin = 9;
const int echoPin = 10;

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  Serial.println("STATUS:READY");
}

void loop() {
  long duration, distance;

  // Clear trigger
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  // Send 10us pulse
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Read echo
  duration = pulseIn(echoPin, HIGH);
  distance = duration * 0.034 / 2;

  Serial.print("DISTANCE:");
  Serial.println(distance);

  delay(500);
}
`
  },
  {
    id: 'dht11-temp-humidity',
    name: 'DHT11 Temperature & Humidity',
    description: 'Read temperature and humidity from DHT11 sensor',
    category: 'sensor',
    difficulty: 'intermediate',
    components: ['DHT11 Sensor', '10kΩ Resistor'],
    wiring: [
      'VCC → 5V',
      'GND → GND',
      'Data → Pin 2 (with 10kΩ pull-up resistor to VCC)'
    ],
    deployed: false,
    code: `// DHT11 Temperature & Humidity Sensor
// Requires DHT library: Sketch > Include Library > Manage Libraries > DHT sensor library

#include <DHT.h>

#define DHTPIN 2
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
  Serial.println("STATUS:READY");
}

void loop() {
  delay(2000);

  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("ERROR:Failed to read from DHT sensor");
    return;
  }

  Serial.print("TEMPERATURE:");
  Serial.println(temperature);

  Serial.print("HUMIDITY:");
  Serial.println(humidity);

  Serial.print("HEAT_INDEX:");
  Serial.println(dht.computeHeatIndex(temperature, humidity, false));
}
`
  },
  {
    id: 'seven-segment',
    name: '7-Segment Display Counter',
    description: 'Display numbers on a 7-segment display',
    category: 'display',
    difficulty: 'intermediate',
    components: ['Common Cathode 7-Segment Display', '7x 220Ω Resistors'],
    wiring: [
      'Segment A → Pin 2 (via 220Ω)',
      'Segment B → Pin 3 (via 220Ω)',
      'Segment C → Pin 4 (via 220Ω)',
      'Segment D → Pin 5 (via 220Ω)',
      'Segment E → Pin 6 (via 220Ω)',
      'Segment F → Pin 7 (via 220Ω)',
      'Segment G → Pin 8 (via 220Ω)',
      'Common Cathode → GND'
    ],
    deployed: false,
    code: `// 7-Segment Display Counter
// Counts 0-9 on common cathode display

const int segPins[] = {2, 3, 4, 5, 6, 7, 8}; // A-G

const byte numbers[10][7] = {
  {1,1,1,1,1,1,0}, // 0
  {0,1,1,0,0,0,0}, // 1
  {1,1,0,1,1,0,1}, // 2
  {1,1,1,1,0,0,1}, // 3
  {0,1,1,0,0,1,1}, // 4
  {1,0,1,1,0,1,1}, // 5
  {1,0,1,1,1,1,1}, // 6
  {1,1,1,0,0,0,0}, // 7
  {1,1,1,1,1,1,1}, // 8
  {1,1,1,1,0,1,1}  // 9
};

void setup() {
  Serial.begin(9600);
  for (int i = 0; i < 7; i++) {
    pinMode(segPins[i], OUTPUT);
  }
  Serial.println("STATUS:READY");
}

void displayNumber(int num) {
  for (int i = 0; i < 7; i++) {
    digitalWrite(segPins[i], numbers[num][i]);
  }
}

void loop() {
  for (int i = 0; i < 10; i++) {
    displayNumber(i);
    Serial.print("DISPLAY:");
    Serial.println(i);
    delay(1000);
  }
}
`
  },
  {
    id: 'rgb-led',
    name: 'RGB LED Color Mixer',
    description: 'Control RGB LED colors with PWM',
    category: 'basic',
    difficulty: 'beginner',
    components: ['RGB LED (Common Cathode)', '3x 220Ω Resistors'],
    wiring: [
      'Red → Pin 9 (via 220Ω)',
      'Green → Pin 10 (via 220Ω)',
      'Blue → Pin 11 (via 220Ω)',
      'Common Cathode → GND'
    ],
    deployed: false,
    code: `// RGB LED Color Mixer
// Cycles through different colors

const int redPin = 9;
const int greenPin = 10;
const int bluePin = 11;

void setup() {
  Serial.begin(9600);
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
  Serial.println("STATUS:READY");
}

void setColor(int red, int green, int blue) {
  analogWrite(redPin, red);
  analogWrite(greenPin, green);
  analogWrite(bluePin, blue);
}

void loop() {
  // Red
  setColor(255, 0, 0);
  Serial.println("COLOR:RED");
  delay(1000);

  // Green
  setColor(0, 255, 0);
  Serial.println("COLOR:GREEN");
  delay(1000);

  // Blue
  setColor(0, 0, 255);
  Serial.println("COLOR:BLUE");
  delay(1000);

  // Yellow
  setColor(255, 255, 0);
  Serial.println("COLOR:YELLOW");
  delay(1000);

  // Cyan
  setColor(0, 255, 255);
  Serial.println("COLOR:CYAN");
  delay(1000);

  // Magenta
  setColor(255, 0, 255);
  Serial.println("COLOR:MAGENTA");
  delay(1000);

  // White
  setColor(255, 255, 255);
  Serial.println("COLOR:WHITE");
  delay(1000);
}
`
  },
  {
    id: 'dc-motor-driver',
    name: 'DC Motor L298N Driver',
    description: 'Control DC motors with L298N motor driver - Web panel compatible',
    category: 'motor',
    difficulty: 'intermediate',
    components: ['L298N Motor Driver', '2x DC Motors', 'External Power Supply (7-12V)'],
    wiring: [
      'Motor A: OUT1 & OUT2 → Motor A terminals',
      'Motor B: OUT3 & OUT4 → Motor B terminals',
      'IN1 → Pin 2',
      'IN2 → Pin 3',
      'IN3 → Pin 4',
      'IN4 → Pin 5',
      'ENA (Enable A) → Pin 9',
      'ENB (Enable B) → Pin 10',
      'GND → Arduino GND',
      '+12V → External power supply',
      'Power supply GND → Arduino GND & L298N GND'
    ],
    deployed: false,
    code: `// DC Motor Control with L298N Driver
// Compatible with Motor Control Panel
// Supports real-time speed and direction control

const int motorA_IN1 = 2;
const int motorA_IN2 = 3;
const int motorA_EN = 9;

const int motorB_IN1 = 4;
const int motorB_IN2 = 5;
const int motorB_EN = 10;

String command = "";
unsigned long lastRpmTime = 0;
int motorASpeed = 0;
int motorBSpeed = 0;

void setup() {
  Serial.begin(9600);

  pinMode(motorA_IN1, OUTPUT);
  pinMode(motorA_IN2, OUTPUT);
  pinMode(motorA_EN, OUTPUT);

  pinMode(motorB_IN1, OUTPUT);
  pinMode(motorB_IN2, OUTPUT);
  pinMode(motorB_EN, OUTPUT);

  stopMotor('A');
  stopMotor('B');

  Serial.println("STATUS:READY");
  Serial.println("MOTOR:READY");
}

void loop() {
  if (Serial.available() > 0) {
    command = Serial.readStringUntil('\\n');
    command.trim();
    processCommand(command);
  }

  // Send performance data every 500ms
  if (millis() - lastRpmTime > 500) {
    sendPerformanceData();
    lastRpmTime = millis();
  }
}

void processCommand(String cmd) {
  // Format: MOTOR:A:FORWARD:200
  // Format: MOTOR:B:BACKWARD:150
  // Format: MOTOR:A:STOP
  // Format: MOTOR:A:SPEED:180

  if (cmd.startsWith("MOTOR:")) {
    int firstColon = cmd.indexOf(':');
    int secondColon = cmd.indexOf(':', firstColon + 1);
    int thirdColon = cmd.indexOf(':', secondColon + 1);

    char motor = cmd.charAt(firstColon + 1);
    String action = cmd.substring(secondColon + 1, thirdColon > 0 ? thirdColon : cmd.length());

    if (action == "FORWARD") {
      int speed = thirdColon > 0 ? cmd.substring(thirdColon + 1).toInt() : 200;
      motorForward(motor, speed);
    }
    else if (action == "BACKWARD") {
      int speed = thirdColon > 0 ? cmd.substring(thirdColon + 1).toInt() : 200;
      motorBackward(motor, speed);
    }
    else if (action == "STOP") {
      stopMotor(motor);
    }
    else if (action == "SPEED") {
      int speed = thirdColon > 0 ? cmd.substring(thirdColon + 1).toInt() : 0;
      setMotorSpeed(motor, speed);
    }
  }
}

void motorForward(char motor, int speed) {
  speed = constrain(speed, 0, 255);

  if (motor == 'A') {
    digitalWrite(motorA_IN1, HIGH);
    digitalWrite(motorA_IN2, LOW);
    analogWrite(motorA_EN, speed);
    motorASpeed = speed;
    Serial.print("MOTOR_A:FORWARD:");
    Serial.println(speed);
  }
  else if (motor == 'B') {
    digitalWrite(motorB_IN1, HIGH);
    digitalWrite(motorB_IN2, LOW);
    analogWrite(motorB_EN, speed);
    motorBSpeed = speed;
    Serial.print("MOTOR_B:FORWARD:");
    Serial.println(speed);
  }
}

void motorBackward(char motor, int speed) {
  speed = constrain(speed, 0, 255);

  if (motor == 'A') {
    digitalWrite(motorA_IN1, LOW);
    digitalWrite(motorA_IN2, HIGH);
    analogWrite(motorA_EN, speed);
    motorASpeed = speed;
    Serial.print("MOTOR_A:BACKWARD:");
    Serial.println(speed);
  }
  else if (motor == 'B') {
    digitalWrite(motorB_IN1, LOW);
    digitalWrite(motorB_IN2, HIGH);
    analogWrite(motorB_EN, speed);
    motorBSpeed = speed;
    Serial.print("MOTOR_B:BACKWARD:");
    Serial.println(speed);
  }
}

void stopMotor(char motor) {
  if (motor == 'A') {
    digitalWrite(motorA_IN1, LOW);
    digitalWrite(motorA_IN2, LOW);
    analogWrite(motorA_EN, 0);
    motorASpeed = 0;
    Serial.println("MOTOR_A:STOPPED");
  }
  else if (motor == 'B') {
    digitalWrite(motorB_IN1, LOW);
    digitalWrite(motorB_IN2, LOW);
    analogWrite(motorB_EN, 0);
    motorBSpeed = 0;
    Serial.println("MOTOR_B:STOPPED");
  }
}

void setMotorSpeed(char motor, int speed) {
  speed = constrain(speed, 0, 255);

  if (motor == 'A') {
    analogWrite(motorA_EN, speed);
    motorASpeed = speed;
    Serial.print("MOTOR_A:SPEED:");
    Serial.println(speed);
  }
  else if (motor == 'B') {
    analogWrite(motorB_EN, speed);
    motorBSpeed = speed;
    Serial.print("MOTOR_B:SPEED:");
    Serial.println(speed);
  }
}

void sendPerformanceData() {
  // Simulated RPM based on speed
  int avgSpeed = (motorASpeed + motorBSpeed) / 2;
  int rpm = map(avgSpeed, 0, 255, 0, 3000);

  // Simulated current draw based on speed
  float current = (avgSpeed / 255.0) * 1.5;

  Serial.print("RPM:");
  Serial.println(rpm);

  Serial.print("CURRENT:");
  Serial.println(current, 2);
}
`
  },
  {
    id: 'servo-motor',
    name: 'Servo Motor Sweep',
    description: 'Control a servo motor with smooth sweeping motion',
    category: 'motor',
    difficulty: 'beginner',
    components: ['Servo Motor'],
    wiring: [
      'Red (VCC) → 5V',
      'Brown/Black (GND) → GND',
      'Orange/Yellow (Signal) → Pin 9'
    ],
    deployed: false,
    code: `// Servo Motor Sweep
// Sweeps servo from 0 to 180 degrees

#include <Servo.h>

Servo myServo;

void setup() {
  Serial.begin(9600);
  myServo.attach(9);
  Serial.println("STATUS:READY");
}

void loop() {
  // Sweep from 0 to 180
  for (int pos = 0; pos <= 180; pos++) {
    myServo.write(pos);
    if (pos % 30 == 0) {
      Serial.print("SERVO_POS:");
      Serial.println(pos);
    }
    delay(15);
  }

  // Sweep from 180 to 0
  for (int pos = 180; pos >= 0; pos--) {
    myServo.write(pos);
    if (pos % 30 == 0) {
      Serial.print("SERVO_POS:");
      Serial.println(pos);
    }
    delay(15);
  }
}
`
  },
  {
    id: 'photoresistor',
    name: 'Light Sensor (LDR)',
    description: 'Measure light levels with a photoresistor',
    category: 'sensor',
    difficulty: 'beginner',
    components: ['Photoresistor (LDR)', '10kΩ Resistor'],
    wiring: [
      'LDR one leg → 5V',
      'LDR other leg → A0 and 10kΩ resistor',
      '10kΩ resistor other leg → GND'
    ],
    deployed: false,
    code: `// Photoresistor Light Sensor
// Reads ambient light level

const int ldrPin = A0;

void setup() {
  Serial.begin(9600);
  pinMode(ldrPin, INPUT);
  Serial.println("STATUS:READY");
}

void loop() {
  int lightLevel = analogRead(ldrPin);
  int percentage = map(lightLevel, 0, 1023, 0, 100);

  Serial.print("LIGHT_LEVEL:");
  Serial.println(lightLevel);

  Serial.print("LIGHT_PERCENT:");
  Serial.println(percentage);

  // Categorize light level
  if (lightLevel < 200) {
    Serial.println("BRIGHTNESS:DARK");
  } else if (lightLevel < 500) {
    Serial.println("BRIGHTNESS:DIM");
  } else if (lightLevel < 800) {
    Serial.println("BRIGHTNESS:MEDIUM");
  } else {
    Serial.println("BRIGHTNESS:BRIGHT");
  }

  delay(500);
}
`
  },
  {
    id: 'buzzer-tones',
    name: 'Buzzer Musical Tones',
    description: 'Play musical notes with a piezo buzzer',
    category: 'basic',
    difficulty: 'beginner',
    components: ['Piezo Buzzer'],
    wiring: [
      'Positive → Pin 8',
      'Negative → GND'
    ],
    deployed: false,
    code: `// Buzzer Musical Tones
// Plays a simple melody

const int buzzerPin = 8;

// Note frequencies
#define NOTE_C4  262
#define NOTE_D4  294
#define NOTE_E4  330
#define NOTE_F4  349
#define NOTE_G4  392
#define NOTE_A4  440
#define NOTE_B4  494
#define NOTE_C5  523

int melody[] = {
  NOTE_C4, NOTE_D4, NOTE_E4, NOTE_F4,
  NOTE_G4, NOTE_A4, NOTE_B4, NOTE_C5
};

int noteDuration = 500;

void setup() {
  Serial.begin(9600);
  pinMode(buzzerPin, OUTPUT);
  Serial.println("STATUS:READY");
}

void loop() {
  for (int i = 0; i < 8; i++) {
    tone(buzzerPin, melody[i], noteDuration);
    Serial.print("TONE:");
    Serial.println(melody[i]);
    delay(noteDuration * 1.3);
  }

  noTone(buzzerPin);
  delay(2000);
}
`
  }
];

export const getCategoryIcon = (category: CodeSnippet['category']): string => {
  const icons = {
    sensor: '📡',
    display: '🖥️',
    basic: '💡',
    motor: '⚙️',
    communication: '📶'
  };
  return icons[category];
};

export const getDifficultyColor = (difficulty: CodeSnippet['difficulty']): string => {
  const colors = {
    beginner: 'bg-green-100 text-green-700 border-green-300',
    intermediate: 'bg-amber-100 text-amber-700 border-amber-300',
    advanced: 'bg-red-100 text-red-700 border-red-300'
  };
  return colors[difficulty];
};
