/*
 * Arduino Control Portal - Sample Sketch
 *
 * This sketch allows your Arduino to communicate with the web portal
 * Upload this to your Arduino board before connecting via USB
 *
 * Supported Commands:
 * - MODE:pin:INPUT or MODE:pin:OUTPUT
 * - DIGITAL_WRITE:pin:HIGH or DIGITAL_WRITE:pin:LOW
 * - DIGITAL_READ:pin
 * - ANALOG_WRITE:pin:value (0-255)
 * - ANALOG_READ:pin
 * - SERVO:pin:angle (0-180)
 * - MOTOR:A:FORWARD:speed or MOTOR:A:BACKWARD:speed or MOTOR:A:STOP
 */

#include <Servo.h>

Servo servo1;
Servo servo2;
int servo1Pin = -1;
int servo2Pin = -1;

int motorA_pin1 = 2;
int motorA_pin2 = 3;
int motorA_enable = 9;
int motorB_pin1 = 4;
int motorB_pin2 = 5;
int motorB_enable = 10;

String inputString = "";
boolean stringComplete = false;

void setup() {
  Serial.begin(9600);
  inputString.reserve(200);

  pinMode(motorA_pin1, OUTPUT);
  pinMode(motorA_pin2, OUTPUT);
  pinMode(motorA_enable, OUTPUT);
  pinMode(motorB_pin1, OUTPUT);
  pinMode(motorB_pin2, OUTPUT);
  pinMode(motorB_enable, OUTPUT);

  digitalWrite(motorA_pin1, LOW);
  digitalWrite(motorA_pin2, LOW);
  digitalWrite(motorB_pin1, LOW);
  digitalWrite(motorB_pin2, LOW);
  analogWrite(motorA_enable, 0);
  analogWrite(motorB_enable, 0);

  Serial.println("STATUS:READY");
  Serial.println("MOTOR:READY");
}

void loop() {
  if (stringComplete) {
    processCommand(inputString);
    inputString = "";
    stringComplete = false;
  }
}

void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    if (inChar == '\n') {
      stringComplete = true;
    } else {
      inputString += inChar;
    }
  }
}

void processCommand(String command) {
  command.trim();

  int firstColon = command.indexOf(':');
  int secondColon = command.indexOf(':', firstColon + 1);

  if (firstColon == -1) return;

  String cmd = command.substring(0, firstColon);
  String pinStr = command.substring(firstColon + 1, secondColon);
  String valueStr = (secondColon != -1) ? command.substring(secondColon + 1) : "";

  int pin = pinStr.toInt();

  if (cmd == "MODE") {
    if (valueStr == "INPUT") {
      pinMode(pin, INPUT);
      Serial.print("MODE:");
      Serial.print(pin);
      Serial.println(":INPUT");
    } else if (valueStr == "OUTPUT") {
      pinMode(pin, OUTPUT);
      Serial.print("MODE:");
      Serial.print(pin);
      Serial.println(":OUTPUT");
    }
  }
  else if (cmd == "DIGITAL_WRITE") {
    int value = (valueStr == "HIGH") ? HIGH : LOW;
    digitalWrite(pin, value);
    Serial.print("DIGITAL_WRITE:");
    Serial.print(pin);
    Serial.print(":");
    Serial.println(valueStr);
  }
  else if (cmd == "DIGITAL_READ") {
    int value = digitalRead(pin);
    Serial.print("DIGITAL_READ:");
    Serial.print(pin);
    Serial.print(":");
    Serial.println(value == HIGH ? "HIGH" : "LOW");
  }
  else if (cmd == "ANALOG_WRITE") {
    int value = valueStr.toInt();
    analogWrite(pin, value);
    Serial.print("ANALOG_WRITE:");
    Serial.print(pin);
    Serial.print(":");
    Serial.println(value);
  }
  else if (cmd == "ANALOG_READ") {
    int value = analogRead(pin);
    Serial.print("ANALOG_READ:");
    Serial.print(pin);
    Serial.print(":");
    Serial.println(value);
  }
  else if (cmd == "SERVO") {
    int angle = valueStr.toInt();
    if (angle >= 0 && angle <= 180) {
      if (servo1Pin == -1) {
        servo1Pin = pin;
        servo1.attach(pin);
      } else if (servo1Pin == pin) {
        servo1.write(angle);
      } else if (servo2Pin == -1) {
        servo2Pin = pin;
        servo2.attach(pin);
      } else if (servo2Pin == pin) {
        servo2.write(angle);
      }

      Serial.print("SERVO:");
      Serial.print(pin);
      Serial.print(":");
      Serial.println(angle);
    }
  }
  else if (cmd == "MOTOR") {
    String motor = pinStr;
    int thirdColon = command.indexOf(':', secondColon + 1);
    String action = valueStr;
    String speedStr = "";

    if (thirdColon != -1) {
      action = command.substring(secondColon + 1, thirdColon);
      speedStr = command.substring(thirdColon + 1);
    }

    if (motor == "A") {
      if (action == "FORWARD") {
        int speed = speedStr.toInt();
        digitalWrite(motorA_pin1, HIGH);
        digitalWrite(motorA_pin2, LOW);
        analogWrite(motorA_enable, speed);
        Serial.print("MOTOR:A:FORWARD:");
        Serial.println(speed);
      }
      else if (action == "BACKWARD") {
        int speed = speedStr.toInt();
        digitalWrite(motorA_pin1, LOW);
        digitalWrite(motorA_pin2, HIGH);
        analogWrite(motorA_enable, speed);
        Serial.print("MOTOR:A:BACKWARD:");
        Serial.println(speed);
      }
      else if (action == "STOP") {
        digitalWrite(motorA_pin1, LOW);
        digitalWrite(motorA_pin2, LOW);
        analogWrite(motorA_enable, 0);
        Serial.println("MOTOR:A:STOP");
      }
      else if (action == "SPEED") {
        int speed = speedStr.toInt();
        analogWrite(motorA_enable, speed);
        Serial.print("MOTOR:A:SPEED:");
        Serial.println(speed);
      }
    }
    else if (motor == "B") {
      if (action == "FORWARD") {
        int speed = speedStr.toInt();
        digitalWrite(motorB_pin1, HIGH);
        digitalWrite(motorB_pin2, LOW);
        analogWrite(motorB_enable, speed);
        Serial.print("MOTOR:B:FORWARD:");
        Serial.println(speed);
      }
      else if (action == "BACKWARD") {
        int speed = speedStr.toInt();
        digitalWrite(motorB_pin1, LOW);
        digitalWrite(motorB_pin2, HIGH);
        analogWrite(motorB_enable, speed);
        Serial.print("MOTOR:B:BACKWARD:");
        Serial.println(speed);
      }
      else if (action == "STOP") {
        digitalWrite(motorB_pin1, LOW);
        digitalWrite(motorB_pin2, LOW);
        analogWrite(motorB_enable, 0);
        Serial.println("MOTOR:B:STOP");
      }
      else if (action == "SPEED") {
        int speed = speedStr.toInt();
        analogWrite(motorB_enable, speed);
        Serial.print("MOTOR:B:SPEED:");
        Serial.println(speed);
      }
    }
  }
}
