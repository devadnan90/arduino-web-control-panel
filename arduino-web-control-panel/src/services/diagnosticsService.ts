export interface DiagnosticTest {
  id: string;
  name: string;
  description: string;
  category: 'pin' | 'connection' | 'power' | 'communication';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  result?: string;
}

export interface CircuitIssue {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  solutions: string[];
  category: 'hardware' | 'software' | 'connection';
}

export const commonCircuitIssues: CircuitIssue[] = [
  {
    id: 'no-connection',
    title: 'Cannot Connect to Arduino',
    description: 'The browser cannot detect or connect to the Arduino board',
    severity: 'critical',
    category: 'connection',
    solutions: [
      'Check USB cable is properly connected',
      'Try a different USB port',
      'Make sure Arduino drivers are installed',
      'Check if another program is using the serial port',
      'Try unplugging and reconnecting the Arduino',
      'Use a data-capable USB cable (not charge-only)'
    ]
  },
  {
    id: 'no-response',
    title: 'Arduino Not Responding to Commands',
    description: 'Connected but pins are not responding to control commands',
    severity: 'critical',
    category: 'software',
    solutions: [
      'Upload the provided Arduino sketch to your board',
      'Verify sketch is running (check Serial Monitor)',
      'Ensure baud rate matches (9600)',
      'Reset Arduino and reconnect',
      'Check for compilation errors in Arduino IDE'
    ]
  },
  {
    id: 'pin-not-working',
    title: 'Specific Pin Not Working',
    description: 'One or more pins do not respond or give incorrect values',
    severity: 'warning',
    category: 'hardware',
    solutions: [
      'Check if pin is configured correctly (INPUT/OUTPUT)',
      'Verify physical connections to the pin',
      'Test with a simple LED circuit first',
      'Check if pin is damaged (try different pin)',
      'Ensure proper ground connection',
      'Check for short circuits'
    ]
  },
  {
    id: 'incorrect-readings',
    title: 'Incorrect Analog Readings',
    description: 'Analog pins showing unexpected or fluctuating values',
    severity: 'warning',
    category: 'hardware',
    solutions: [
      'Add pull-down resistor (10kΩ) to floating inputs',
      'Check sensor/component connections',
      'Verify power supply voltage (5V or 3.3V)',
      'Add decoupling capacitors near sensors',
      'Keep analog wires away from power lines',
      'Use shielded cables for long connections'
    ]
  },
  {
    id: 'power-issue',
    title: 'Power Supply Problems',
    description: 'Arduino resets randomly or components not working properly',
    severity: 'critical',
    category: 'hardware',
    solutions: [
      'Use external power supply for high-current loads',
      'Check voltage levels with multimeter',
      'Add capacitors across power rails',
      'Reduce number of devices drawing power',
      'Check for loose connections',
      'Verify barrel jack or Vin voltage (7-12V)'
    ]
  },
  {
    id: 'serial-corruption',
    title: 'Garbled or Missing Serial Data',
    description: 'Data monitor shows corrupted or incomplete messages',
    severity: 'warning',
    category: 'communication',
    solutions: [
      'Verify baud rate is 9600 on both sides',
      'Check USB cable quality',
      'Reduce serial communication speed',
      'Add delays between commands',
      'Check for electromagnetic interference',
      'Disconnect serial during sketch upload'
    ]
  },
  {
    id: 'pwm-not-working',
    title: 'PWM Output Not Working',
    description: 'PWM pins not producing variable output',
    severity: 'warning',
    category: 'hardware',
    solutions: [
      'Verify pin supports PWM (pins 3, 5, 6, 9, 10, 11)',
      'Use analogWrite() not digitalWrite()',
      'Check if servo library conflicts with PWM',
      'Test with LED to visualize brightness change',
      'Ensure load can handle PWM signal',
      'Add RC filter for smooth DC output if needed'
    ]
  },
  {
    id: 'ground-issue',
    title: 'Ground Reference Problems',
    description: 'Erratic behavior or communication issues',
    severity: 'critical',
    category: 'hardware',
    solutions: [
      'Connect all grounds together (common ground)',
      'Arduino ground must connect to circuit ground',
      'Check continuity of ground connections',
      'Avoid ground loops in complex circuits',
      'Use star grounding topology',
      'Keep ground traces thick and short'
    ]
  }
];

export const diagnosticTests: DiagnosticTest[] = [
  {
    id: 'serial-connection',
    name: 'Serial Connection',
    description: 'Verify USB serial connection is established',
    category: 'connection',
    status: 'pending'
  },
  {
    id: 'handshake',
    name: 'Communication Handshake',
    description: 'Test bidirectional communication with Arduino',
    category: 'communication',
    status: 'pending'
  },
  {
    id: 'digital-write',
    name: 'Digital Write Test',
    description: 'Test digital output on pin 13 (built-in LED)',
    category: 'pin',
    status: 'pending'
  },
  {
    id: 'digital-read',
    name: 'Digital Read Test',
    description: 'Test digital input reading capability',
    category: 'pin',
    status: 'pending'
  },
  {
    id: 'analog-read',
    name: 'Analog Read Test',
    description: 'Test analog input reading on A0',
    category: 'pin',
    status: 'pending'
  },
  {
    id: 'pwm-output',
    name: 'PWM Output Test',
    description: 'Test PWM functionality on pin 9',
    category: 'pin',
    status: 'pending'
  },
  {
    id: 'response-time',
    name: 'Response Time',
    description: 'Measure command response latency',
    category: 'communication',
    status: 'pending'
  },
  {
    id: 'power-status',
    name: 'Power Supply Check',
    description: 'Verify board is receiving stable power',
    category: 'power',
    status: 'pending'
  }
];

export const debuggingTips = [
  {
    title: 'Use the Built-in LED',
    tip: 'Pin 13 has a built-in LED on most Arduinos. Test this first to verify basic functionality.'
  },
  {
    title: 'Check Serial Monitor',
    tip: 'Open Arduino IDE Serial Monitor (9600 baud) to see raw communication and debug messages.'
  },
  {
    title: 'Test Incrementally',
    tip: 'Start with simple tests (one LED) before adding complex circuits. Add components one at a time.'
  },
  {
    title: 'Measure Voltages',
    tip: 'Use a multimeter to verify 5V and 3.3V rails are outputting correct voltages.'
  },
  {
    title: 'Check Continuity',
    tip: 'Use multimeter continuity mode to verify connections in your circuit.'
  },
  {
    title: 'Isolate the Problem',
    tip: 'Disconnect external components and test Arduino alone to identify if issue is board or circuit.'
  },
  {
    title: 'Read Error Messages',
    tip: 'Browser console (F12) may show helpful error messages about connection issues.'
  },
  {
    title: 'Power Requirements',
    tip: 'USB provides ~500mA. If drawing more, use external power supply (7-12V on barrel jack).'
  },
  {
    title: 'Reset Button',
    tip: 'Press reset button on Arduino to restart sketch. Reconnect serial after reset.'
  },
  {
    title: 'Check Pin Modes',
    tip: 'Pins must be set to correct mode (INPUT/OUTPUT) before use. Some pins have special functions.'
  }
];
