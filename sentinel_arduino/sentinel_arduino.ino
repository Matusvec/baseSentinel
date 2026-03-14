// sentinel_arduino.ino
// SENTINEL — Autonomous AI Perception & Tracking Station
// Controls servos, reads sensors, communicates with RPi via serial

#include <Servo.h>
#include <Wire.h>
#include <NewPing.h>

// ===== SERVO SETUP =====
Servo panServo;
Servo tiltServo;
const int PAN_PIN = 9;
const int TILT_PIN = 10;
int currentPan = 90;
int currentTilt = 90;

// ===== ULTRASONIC SETUP =====
#define FRONT_TRIG 2
#define FRONT_ECHO 3
#define LEFT_TRIG 4
#define LEFT_ECHO 5
#define RIGHT_TRIG 6
#define RIGHT_ECHO 7
#define MAX_DISTANCE 400

NewPing sonarFront(FRONT_TRIG, FRONT_ECHO, MAX_DISTANCE);
NewPing sonarLeft(LEFT_TRIG, LEFT_ECHO, MAX_DISTANCE);
NewPing sonarRight(RIGHT_TRIG, RIGHT_ECHO, MAX_DISTANCE);

// ===== IR BREAK BEAMS =====
#define IR_BEAM_1 8
#define IR_BEAM_2 11

// ===== GROVE COMPONENTS =====
#define BUZZER_PIN A0
#define SOUND_PIN A1
#define LED_PIN_1 12
#define LED_PIN_2 13

// ===== SCAN PATTERN =====
bool scanning = false;
int scanDirection = 1;
int scanTiltStep = 0;
unsigned long lastScanStep = 0;
const int SCAN_INTERVAL = 100;
const int SCAN_PAN_STEP = 3;

// ===== COMMUNICATION PROTOCOL =====
// Commands FROM RPi (over serial):
//   "MOVE:120,75"   → Move both servos
//   "PAN:120"       → Move pan servo
//   "TILT:75"       → Move tilt servo
//   "SCAN:START"    → Begin scan pattern
//   "SCAN:STOP"     → Stop scanning
//   "LED:GREEN"     → Set LEDs green
//   "LED:YELLOW"    → Set LEDs yellow
//   "LED:RED"       → Set LEDs red
//   "BUZZ:ON"       → Buzzer on
//   "BUZZ:OFF"      → Buzzer off
//   "READ"          → Request sensor readings
//
// Data TO RPi (JSON over serial):
//   {"d":{"f":180,"l":250,"r":310},"ir":[0,0],"s":512,"p":90,"t":90}

void setup() {
  Serial.begin(115200);

  panServo.attach(PAN_PIN);
  tiltServo.attach(TILT_PIN);
  panServo.write(90);
  tiltServo.write(90);

  pinMode(IR_BEAM_1, INPUT_PULLUP);
  pinMode(IR_BEAM_2, INPUT_PULLUP);

  pinMode(LED_PIN_1, OUTPUT);
  pinMode(LED_PIN_2, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  pinMode(SOUND_PIN, INPUT);

  Wire.begin();

  // Boot sequence
  digitalWrite(LED_PIN_1, HIGH);
  delay(200);
  digitalWrite(LED_PIN_2, HIGH);
  delay(200);

  Serial.println("{\"status\":\"SENTINEL_ARDUINO_READY\"}");
}

void loop() {
  if (Serial.available()) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    handleCommand(cmd);
  }

  if (scanning) {
    runScanPattern();
  }

  // Auto-send sensor data every 200ms
  static unsigned long lastSend = 0;
  if (millis() - lastSend > 200) {
    sendSensorData();
    lastSend = millis();
  }
}

void handleCommand(String cmd) {
  if (cmd.startsWith("MOVE:")) {
    int commaIdx = cmd.indexOf(',', 5);
    int pan = cmd.substring(5, commaIdx).toInt();
    int tilt = cmd.substring(commaIdx + 1).toInt();
    moveServos(pan, tilt);
    scanning = false;
  }
  else if (cmd.startsWith("PAN:")) {
    int angle = cmd.substring(4).toInt();
    moveServos(angle, currentTilt);
    scanning = false;
  }
  else if (cmd.startsWith("TILT:")) {
    int angle = cmd.substring(5).toInt();
    moveServos(currentPan, angle);
    scanning = false;
  }
  else if (cmd == "SCAN:START") {
    scanning = true;
    scanDirection = 1;
    scanTiltStep = 0;
  }
  else if (cmd == "SCAN:STOP") {
    scanning = false;
  }
  else if (cmd == "LED:GREEN") {
    digitalWrite(LED_PIN_1, HIGH);
    digitalWrite(LED_PIN_2, LOW);
  }
  else if (cmd == "LED:YELLOW") {
    digitalWrite(LED_PIN_1, HIGH);
    digitalWrite(LED_PIN_2, HIGH);
  }
  else if (cmd == "LED:RED") {
    digitalWrite(LED_PIN_1, LOW);
    digitalWrite(LED_PIN_2, HIGH);
  }
  else if (cmd == "BUZZ:ON") {
    tone(BUZZER_PIN, 1000);
  }
  else if (cmd == "BUZZ:OFF") {
    noTone(BUZZER_PIN);
  }
  else if (cmd == "READ") {
    sendSensorData();
  }
}

void moveServos(int pan, int tilt) {
  pan = constrain(pan, 0, 180);
  tilt = constrain(tilt, 45, 135);

  // Smooth movement
  while (currentPan != pan || currentTilt != tilt) {
    if (currentPan < pan) currentPan = min(currentPan + 2, pan);
    else if (currentPan > pan) currentPan = max(currentPan - 2, pan);

    if (currentTilt < tilt) currentTilt = min(currentTilt + 2, tilt);
    else if (currentTilt > tilt) currentTilt = max(currentTilt - 2, tilt);

    panServo.write(currentPan);
    tiltServo.write(currentTilt);
    delay(15);
  }
}

void runScanPattern() {
  if (millis() - lastScanStep < SCAN_INTERVAL) return;
  lastScanStep = millis();

  currentPan += scanDirection * SCAN_PAN_STEP;

  if (currentPan >= 170) {
    scanDirection = -1;
    scanTiltStep++;
    currentTilt = constrain(90 + scanTiltStep * 10, 45, 135);
    tiltServo.write(currentTilt);
  }
  else if (currentPan <= 10) {
    scanDirection = 1;
    if (scanTiltStep >= 3) {
      scanTiltStep = 0;
      currentTilt = 90;
      tiltServo.write(currentTilt);
    }
  }

  panServo.write(currentPan);
}

void sendSensorData() {
  unsigned int frontDist = sonarFront.ping_cm();
  unsigned int leftDist = sonarLeft.ping_cm();
  unsigned int rightDist = sonarRight.ping_cm();

  if (frontDist == 0) frontDist = MAX_DISTANCE;
  if (leftDist == 0) leftDist = MAX_DISTANCE;
  if (rightDist == 0) rightDist = MAX_DISTANCE;

  int ir1 = !digitalRead(IR_BEAM_1);
  int ir2 = !digitalRead(IR_BEAM_2);

  int soundLevel = analogRead(SOUND_PIN);

  // Compact JSON output
  Serial.print("{\"d\":{\"f\":");
  Serial.print(frontDist);
  Serial.print(",\"l\":");
  Serial.print(leftDist);
  Serial.print(",\"r\":");
  Serial.print(rightDist);
  Serial.print("},\"ir\":[");
  Serial.print(ir1);
  Serial.print(",");
  Serial.print(ir2);
  Serial.print("],\"s\":");
  Serial.print(soundLevel);
  Serial.print(",\"p\":");
  Serial.print(currentPan);
  Serial.print(",\"t\":");
  Serial.print(currentTilt);
  Serial.println("}");
}
